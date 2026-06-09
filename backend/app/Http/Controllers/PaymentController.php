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
use Illuminate\Support\Facades\Log;
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

                if (! in_array($application->payment_status, ['unpaid', 'failed'], true)) {
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

                if (! $application->room->is_available || $application->room->room_status !== 'available') {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Kamar sudah tidak tersedia untuk dibayar',
                    ], 422));
                }

                $durationMonths = $this->getDurationInMonths($application);
                $roomPrice = (int) $application->room->price;
                $grossAmount = $roomPrice * $durationMonths;

                $payment = $application->payment ?? new Payment([
                    'rental_application_id' => $application->id,
                    'order_id' => $this->generateOrderId($application),
                    'gross_amount' => $grossAmount,
                    'transaction_status' => 'pending',
                ]);

                if ($application->payment_status === 'failed') {
                    $payment->order_id = $this->generateOrderId($application);
                    $payment->snap_token = null;
                    $payment->transaction_id = null;
                    $payment->payment_type = null;
                    $payment->paid_at = null;
                    $application->payment_status = 'unpaid';
                    $application->save();
                }

                if (! $payment->snap_token) {
                    $payment->order_id ??= $this->generateOrderId($application);
                    $payment->gross_amount = $grossAmount;
                    $payment->transaction_status = 'pending';
                    $payment->snap_token = $this->midtrans->createSnapToken(
                        $this->buildSnapPayload($payment, $application, $this->resolveFrontendOrigin($request))
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
        Log::info('Midtrans notification received', $request->all());

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

                return $this->updatePaymentFromMidtransStatus($payment, $payload);
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

    public function syncStatus(Request $request): JsonResponse
    {
        if ($response = $this->ensureTenant($request)) {
            return $response;
        }

        $validator = Validator::make($request->all(), [
            'order_id' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi sinkronisasi pembayaran gagal', $validator->errors());
        }

        $orderId = $validator->validated()['order_id'];

        try {
            $statusPayload = $this->midtrans->getTransactionStatus($orderId);
            $payment = DB::transaction(function () use ($request, $orderId, $statusPayload): Payment {
                $payment = Payment::with(['rentalApplication.room'])
                    ->where('order_id', $orderId)
                    ->whereHas('rentalApplication', fn ($query) => $query->where('user_id', $request->user()->id))
                    ->lockForUpdate()
                    ->firstOrFail();

                return $this->updatePaymentFromMidtransStatus($payment, $statusPayload);
            });
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan',
            ], 404);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyinkronkan status pembayaran',
            ], 502);
        }

        return response()->json([
            'success' => true,
            'data' => $payment,
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

    private function updatePaymentFromMidtransStatus(Payment $payment, array $payload): Payment
    {
        $status = (string) ($payload['transaction_status'] ?? $payment->transaction_status);
        $grossAmount = $payload['gross_amount'] ?? $payment->gross_amount;

        $payment->update([
            'transaction_id' => $payload['transaction_id'] ?? $payment->transaction_id,
            'payment_type' => $payload['payment_type'] ?? $payment->payment_type,
            'gross_amount' => is_numeric($grossAmount)
                ? (int) round((float) $grossAmount)
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

        return $payment->fresh(['rentalApplication.room.branch']);
    }

    private function buildSnapPayload(Payment $payment, RentalApplication $application, ?string $frontendOrigin = null): array
    {
        $durationMonths = $this->getDurationInMonths($application);
        $roomPrice = (int) $application->room->price;
        $finishUrl = $frontendOrigin
            ? rtrim($frontendOrigin, '/').'/tenant/rental-applications/'.$application->id
            : null;

        $payload = [
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
                    'price' => $roomPrice,
                    'quantity' => $durationMonths,
                    'name' => $application->room->room_name,
                ],
            ],
        ];

        if ($finishUrl) {
            $payload['callbacks'] = [
                'finish' => $finishUrl,
            ];
        }

        return $payload;
    }

    private function getDurationInMonths(RentalApplication $application): int
    {
        preg_match('/\d+/', (string) $application->duration, $matches);

        return max(1, (int) ($matches[0] ?? 1));
    }

    private function calculateEndDate(RentalApplication $application): ?string
    {
        if (! $application->move_in_date) {
            return null;
        }

        $months = $this->getDurationInMonths($application);

        return $application->move_in_date->copy()->addMonthsNoOverflow($months)->toDateString();
    }

    private function generateOrderId(RentalApplication $application): string
    {
        return sprintf('KH-%s-%s', $application->id, now()->timestamp);
    }

    private function resolveFrontendOrigin(Request $request): ?string
    {
        $origin = $request->headers->get('Origin');

        if (! $origin && $request->headers->get('Referer')) {
            $referer = parse_url($request->headers->get('Referer'));
            if (isset($referer['scheme'], $referer['host'])) {
                $origin = $referer['scheme'].'://'.$referer['host'].(isset($referer['port']) ? ':'.$referer['port'] : '');
            }
        }

        $configuredOrigin = config('app.frontend_url') ?: env('FRONTEND_URL');
        $origin ??= $configuredOrigin;

        if (! $origin || str_contains($origin, 'example.com')) {
            return null;
        }

        return rtrim($origin, '/');
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
