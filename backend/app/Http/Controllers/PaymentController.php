<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\RentalApplication;
use App\Models\RoomOccupancy;
use App\Services\MidtransService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Throwable;

class PaymentController extends Controller
{
    public function __construct(private readonly MidtransService $midtrans) {}

    public function create(Request $request): JsonResponse
    {
        if ($response = $this->ensureTenant($request)) {
            return $response;
        }

        $validator = Validator::make($request->all(), [
            'rental_application_id' => ['required', 'integer', 'exists:rental_applications,id'],
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi pembayaran gagal', $validator->errors());
        }

        try {
            $payment = DB::transaction(function () use ($request, $validator): Payment {
                $application = RentalApplication::with(['payment', 'room', 'user'])
                    ->where('user_id', $request->user()->id)
                    ->lockForUpdate()
                    ->findOrFail($validator->validated()['rental_application_id']);

                if ($application->status !== 'approved') {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Pengajuan sewa belum disetujui',
                    ], 422));
                }

                if ($application->payment_status !== 'unpaid') {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Status pembayaran tidak valid untuk membuat pembayaran',
                    ], 422));
                }

                if (! $application->room) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Kamar untuk pengajuan sewa tidak ditemukan',
                    ], 422));
                }

                $payment = $application->payment ?? new Payment([
                    'rental_application_id' => $application->id,
                    'order_id' => $this->generateOrderId($application),
                    'gross_amount' => $application->room->price,
                    'transaction_status' => 'pending',
                ]);

                if (! $payment->snap_token) {
                    $payment->order_id ??= $this->generateOrderId($application);
                    $payment->gross_amount = $application->room->price;
                    $payment->transaction_status = 'pending';
                    $payment->snap_token = $this->midtrans->createSnapToken(
                        $this->buildSnapPayload($payment, $application)
                    );
                    $payment->save();
                }

                return $payment->fresh(['rentalApplication.room']);
            });
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan sewa tidak ditemukan',
            ], 404);
        } catch (HttpResponseException $exception) {
            return $exception->getResponse();
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pembayaran Midtrans',
            ], 502);
        }

        return response()->json([
            'success' => true,
            'snap_token' => $payment->snap_token,
            'order_id' => $payment->order_id,
        ], 201);
    }

    public function notification(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_id' => ['required', 'string'],
            'transaction_status' => ['required', 'string', Rule::in([
                'settlement',
                'capture',
                'pending',
                'expire',
                'cancel',
                'deny',
            ])],
            'signature_key' => ['required', 'string'],
            'status_code' => ['required', 'string'],
            'gross_amount' => ['required'],
            'transaction_id' => ['nullable', 'string'],
            'payment_type' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi notifikasi pembayaran gagal', $validator->errors());
        }

        $payload = $validator->validated();

        if (! $this->midtrans->isValidNotificationSignature($request->all())) {
            return response()->json([
                'success' => false,
                'message' => 'Signature notifikasi Midtrans tidak valid',
            ], 401);
        }

        try {
            $payment = DB::transaction(function () use ($payload): Payment {
                $payment = Payment::with(['rentalApplication.room'])
                    ->where('order_id', $payload['order_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                $status = $payload['transaction_status'];

                $payment->update([
                    'transaction_id' => $payload['transaction_id'] ?? $payment->transaction_id,
                    'payment_type' => $payload['payment_type'] ?? $payment->payment_type,
                    'gross_amount' => isset($payload['gross_amount'])
                        ? (int) round((float) $payload['gross_amount'])
                        : $payment->gross_amount,
                    'transaction_status' => $status,
                    'paid_at' => $this->isSuccessfulStatus($status)
                        ? ($payment->paid_at ?? now())
                        : $payment->paid_at,
                ]);

                if ($this->isSuccessfulStatus($status)) {
                    $this->applySuccessfulPayment($payment->fresh(['rentalApplication.room']));
                }

                if ($this->isFailedStatus($status)) {
                    $this->applyFailedPayment($payment->fresh(['rentalApplication']));
                }

                return $payment->fresh(['rentalApplication.room']);
            });
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'payment' => $payment,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        if ($response = $this->ensureTenant($request)) {
            return $response;
        }

        $payments = Payment::with(['rentalApplication.room.branch'])
            ->whereHas('rentalApplication', fn ($query) => $query->where('user_id', $request->user()->id))
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        if ($response = $this->ensureTenant($request)) {
            return $response;
        }

        $payment = Payment::with(['rentalApplication.room.branch'])
            ->whereHas('rentalApplication', fn ($query) => $query->where('user_id', $request->user()->id))
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $payment,
        ]);
    }

    private function applySuccessfulPayment(Payment $payment): void
    {
        $application = $payment->rentalApplication;

        if (! $application || ! $application->room) {
            return;
        }

        $application->update([
            'payment_status' => 'paid',
            'paid_at' => $application->paid_at ?? now(),
        ]);

        RoomOccupancy::firstOrCreate(
            ['rental_application_id' => $application->id],
            [
                'user_id' => $application->user_id,
                'room_id' => $application->room_id,
                'start_date' => $application->move_in_date?->toDateString(),
                'end_date' => $this->calculateEndDate($application),
                'status' => 'active',
            ]
        );

        $application->room->update([
            'is_available' => false,
            'room_status' => 'occupied',
        ]);
    }

    private function applyFailedPayment(Payment $payment): void
    {
        $payment->rentalApplication?->update([
            'payment_status' => 'failed',
        ]);
    }

    private function buildSnapPayload(Payment $payment, RentalApplication $application): array
    {
        return [
            'transaction_details' => [
                'order_id' => $payment->order_id,
                'gross_amount' => $payment->gross_amount,
            ],
            'customer_details' => [
                'first_name' => $application->user?->name,
                'email' => $application->user?->email,
                'phone' => $application->user?->phone,
            ],
            'item_details' => [
                [
                    'id' => 'ROOM-'.$application->room->id,
                    'price' => $payment->gross_amount,
                    'quantity' => 1,
                    'name' => $application->room->room_name,
                ],
            ],
        ];
    }

    private function calculateEndDate(RentalApplication $application): ?string
    {
        if (! $application->move_in_date) {
            return null;
        }

        preg_match('/\d+/', (string) $application->duration, $matches);
        $months = max(1, (int) ($matches[0] ?? 1));

        return $application->move_in_date->copy()->addMonthsNoOverflow($months)->toDateString();
    }

    private function generateOrderId(RentalApplication $application): string
    {
        return sprintf('KH-%s-%s', $application->id, now()->timestamp);
    }

    private function isSuccessfulStatus(string $status): bool
    {
        return in_array($status, ['settlement', 'capture'], true);
    }

    private function isFailedStatus(string $status): bool
    {
        return in_array($status, ['expire', 'cancel', 'deny'], true);
    }

    private function ensureTenant(Request $request): ?JsonResponse
    {
        if ($request->user()?->role === 'tenant') {
            return null;
        }

        return response()->json([
            'success' => false,
            'message' => 'Hanya tenant yang dapat mengakses pembayaran',
        ], 403);
    }

    private function validationError(string $message, mixed $errors): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], 422);
    }
}
