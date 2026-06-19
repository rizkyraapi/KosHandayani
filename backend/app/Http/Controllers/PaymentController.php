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
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Throwable;

class PaymentController extends Controller
{
    private const DURATION_DISCOUNTS = [
        1 => 0,
        3 => 100000,
        6 => 200000,
        12 => 300000,
    ];

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

                $amounts = $this->calculatePaymentAmounts($application);

                $payment = $application->payment ?? new Payment([
                    'rental_application_id' => $application->id,
                    'payment_category' => Payment::CATEGORY_INITIAL_RENT,
                    'order_id' => $this->generateOrderId($application),
                    'subtotal_amount' => $amounts['subtotal_amount'],
                    'discount_amount' => $amounts['discount_amount'],
                    'duration_months' => $amounts['duration_months'],
                    'monthly_price' => $amounts['monthly_price'],
                    'period_start' => $application->move_in_date?->toDateString(),
                    'period_end' => $this->calculateEndDate($application),
                    'gross_amount' => $amounts['gross_amount'],
                    'transaction_status' => 'pending',
                ]);

                if ($application->payment_status === 'failed' || $this->paymentAmountsChanged($payment, $amounts)) {
                    $payment->order_id = $this->generateOrderId($application);
                    $payment->snap_token = null;
                    $payment->transaction_id = null;
                    $payment->payment_type = null;
                    $payment->paid_at = null;
                    $payment->settlement_time = null;
                    $application->payment_status = 'unpaid';
                    $application->save();
                }

                if (! $payment->snap_token) {
                    $payment->order_id ??= $this->generateOrderId($application);
                    $payment->payment_category = Payment::CATEGORY_INITIAL_RENT;
                    $payment->subtotal_amount = $amounts['subtotal_amount'];
                    $payment->discount_amount = $amounts['discount_amount'];
                    $payment->duration_months = $amounts['duration_months'];
                    $payment->monthly_price = $amounts['monthly_price'];
                    $payment->period_start = $application->move_in_date?->toDateString();
                    $payment->period_end = $this->calculateEndDate($application);
                    $payment->gross_amount = $amounts['gross_amount'];
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

    public function renewalContext(Request $request): JsonResponse
    {
        if ($response = $this->ensureTenant($request)) {
            return $response;
        }

        $occupancy = $this->activeOccupancyQuery((int) $request->user()->id)
            ->first();

        if (! $occupancy) {
            return response()->json([
                'success' => false,
                'message' => 'Hunian aktif tidak ditemukan',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatRenewalContext($occupancy),
        ]);
    }

    public function createRenewal(Request $request): JsonResponse
    {
        if ($response = $this->ensureTenant($request)) {
            return $response;
        }

        $validator = Validator::make($request->all(), [
            'duration_months' => ['required', 'integer', Rule::in(array_keys(self::DURATION_DISCOUNTS))],
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi perpanjangan sewa gagal', $validator->errors());
        }

        try {
            $payment = DB::transaction(function () use ($request, $validator): Payment {
                $durationMonths = (int) $validator->validated()['duration_months'];
                $occupancy = $this->activeOccupancyQuery((int) $request->user()->id)
                    ->lockForUpdate()
                    ->first();

                if (! $occupancy) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Hunian aktif tidak ditemukan',
                    ], 422));
                }

                $application = $occupancy->rentalApplication;
                $room = $occupancy->room;

                if (! $application || $application->status !== 'approved' || $application->payment_status !== 'paid') {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Hunian belum memiliki pengajuan sewa yang sudah dibayar',
                    ], 422));
                }

                if (! $room || $room->room_status !== 'occupied') {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Kamar tidak aktif untuk perpanjangan sewa',
                    ], 422));
                }

                if (! $occupancy->end_date) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Tanggal akhir sewa belum tersedia',
                    ], 422));
                }

                $pendingRenewal = Payment::query()
                    ->where('room_occupancy_id', $occupancy->id)
                    ->where('payment_category', Payment::CATEGORY_RENEWAL)
                    ->where('transaction_status', 'pending')
                    ->lockForUpdate()
                    ->first();

                if ($pendingRenewal) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Masih ada pembayaran perpanjangan yang menunggu penyelesaian',
                    ], 422));
                }

                $amounts = $this->calculatePaymentAmountsFor((int) $room->price, $durationMonths);
                $periodStart = $occupancy->end_date->copy()->addDay();
                $periodEnd = $periodStart->copy()->addMonthsNoOverflow($durationMonths);

                $payment = Payment::create([
                    'rental_application_id' => $application->id,
                    'room_occupancy_id' => $occupancy->id,
                    'payment_category' => Payment::CATEGORY_RENEWAL,
                    'order_id' => $this->generateRenewalOrderId($occupancy),
                    'subtotal_amount' => $amounts['subtotal_amount'],
                    'discount_amount' => $amounts['discount_amount'],
                    'duration_months' => $amounts['duration_months'],
                    'monthly_price' => $amounts['monthly_price'],
                    'period_start' => $periodStart->toDateString(),
                    'period_end' => $periodEnd->toDateString(),
                    'gross_amount' => $amounts['gross_amount'],
                    'transaction_status' => 'pending',
                ]);

                $payment->snap_token = $this->midtrans->createSnapToken(
                    $this->buildSnapPayload($payment, $application, $this->resolveFrontendOrigin($request))
                );
                $payment->save();

                return $payment->fresh(['rentalApplication.room.branch', 'roomOccupancy']);
            });
        } catch (HttpResponseException $exception) {
            return $exception->getResponse();
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pembayaran perpanjangan sewa',
            ], 502);
        }

        return response()->json([
            'success' => true,
            'snap_token' => $payment->snap_token,
            'order_id' => $payment->order_id,
            'payment' => $payment,
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
            'settlement_time' => ['nullable', 'string'],
            'transaction_time' => ['nullable', 'string'],
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
                $payment = Payment::with(['rentalApplication.room', 'roomOccupancy'])
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
                $payment = Payment::with(['rentalApplication.room', 'roomOccupancy'])
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

        $payments = Payment::with(['rentalApplication.room.branch', 'rentalApplication.roomOccupancy', 'roomOccupancy'])
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

        $payment = Payment::with(['rentalApplication.room.branch', 'rentalApplication.roomOccupancy', 'roomOccupancy'])
            ->whereHas('rentalApplication', fn ($query) => $query->where('user_id', $request->user()->id))
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $payment,
        ]);
    }

    private function applySuccessfulPayment(Payment $payment): void
    {
        if ($payment->payment_category === Payment::CATEGORY_RENEWAL) {
            $this->applySuccessfulRenewalPayment($payment);

            return;
        }

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

    private function applySuccessfulRenewalPayment(Payment $payment): void
    {
        $occupancy = $payment->roomOccupancy;

        if (! $occupancy || ! $payment->period_end) {
            return;
        }

        $occupancy->update([
            'end_date' => $payment->period_end->toDateString(),
            'status' => 'active',
        ]);
    }

    private function applyFailedPayment(Payment $payment): void
    {
        if ($payment->payment_category === Payment::CATEGORY_RENEWAL) {
            return;
        }

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
            'settlement_time' => $this->isSuccessfulStatus($status)
                ? ($payment->settlement_time ?? $this->resolveSettlementTime($payload))
                : $payment->settlement_time,
        ]);

        if ($this->isSuccessfulStatus($status)) {
            $this->applySuccessfulPayment($payment->fresh(['rentalApplication.room', 'roomOccupancy']));
        }

        if ($this->isFailedStatus($status)) {
            $this->applyFailedPayment($payment->fresh(['rentalApplication']));
        }

        return $payment->fresh(['rentalApplication.room.branch', 'roomOccupancy']);
    }

    private function buildSnapPayload(Payment $payment, RentalApplication $application, ?string $frontendOrigin = null): array
    {
        $isRenewal = $payment->payment_category === Payment::CATEGORY_RENEWAL;
        $durationMonths = (int) ($payment->duration_months ?: $this->getDurationInMonths($application));
        $roomPrice = (int) ($payment->monthly_price ?: $application->room->price);
        $discountAmount = max(0, (int) $payment->discount_amount);
        $finishUrl = $frontendOrigin
            ? rtrim($frontendOrigin, '/').($isRenewal ? '/tenant/perpanjang-sewa' : '/tenant/rental-applications/'.$application->id)
            : null;

        $itemDetails = [
            [
                'id' => ($isRenewal ? 'RENEWAL-ROOM-' : 'ROOM-').$application->room->id,
                'price' => $roomPrice,
                'quantity' => $durationMonths,
                'name' => ($isRenewal ? 'Perpanjangan sewa ' : 'Biaya sewa ').$application->room->room_name,
            ],
        ];

        if ($discountAmount > 0) {
            $itemDetails[] = [
                'id' => ($isRenewal ? 'RENEWAL-DISC-' : 'DISC-').$durationMonths.'M',
                'price' => -$discountAmount,
                'quantity' => 1,
                'name' => ($isRenewal ? 'Diskon Perpanjangan ' : 'Diskon Sewa ').$durationMonths.' Bulan',
            ];
        }

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
            'item_details' => $itemDetails,
        ];

        if ($finishUrl) {
            $payload['callbacks'] = [
                'finish' => $finishUrl,
            ];
        }

        return $payload;
    }

    private function calculatePaymentAmounts(RentalApplication $application): array
    {
        return $this->calculatePaymentAmountsFor(
            (int) $application->room->price,
            $this->getDurationInMonths($application)
        );
    }

    private function calculatePaymentAmountsFor(int $monthlyPrice, int $durationMonths): array
    {
        $durationMonths = max(1, $durationMonths);
        $roomPrice = max(0, $monthlyPrice);
        $subtotalAmount = $roomPrice * $durationMonths;
        $discountAmount = min($subtotalAmount, $this->getDiscountAmount($durationMonths));

        return [
            'subtotal_amount' => $subtotalAmount,
            'discount_amount' => $discountAmount,
            'duration_months' => $durationMonths,
            'monthly_price' => $roomPrice,
            'gross_amount' => max(0, $subtotalAmount - $discountAmount),
        ];
    }

    private function getDiscountAmount(int $durationMonths): int
    {
        return max(0, self::DURATION_DISCOUNTS[$durationMonths] ?? 0);
    }

    private function paymentAmountsChanged(Payment $payment, array $amounts): bool
    {
        if (! $payment->exists) {
            return false;
        }

        return (int) $payment->subtotal_amount !== $amounts['subtotal_amount']
            || (int) $payment->discount_amount !== $amounts['discount_amount']
            || (int) $payment->gross_amount !== $amounts['gross_amount'];
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

    private function activeOccupancyQuery(int $userId)
    {
        return RoomOccupancy::with(['room.branch', 'rentalApplication.payment'])
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->latest();
    }

    private function formatRenewalContext(RoomOccupancy $occupancy): array
    {
        $room = $occupancy->room;
        $monthlyPrice = max(0, (int) ($room?->price ?? 0));
        $pendingRenewal = Payment::query()
            ->where('room_occupancy_id', $occupancy->id)
            ->where('payment_category', Payment::CATEGORY_RENEWAL)
            ->where('transaction_status', 'pending')
            ->latest()
            ->first();
        $branch = $room?->branch;
        $branchName = is_object($branch)
            ? ($branch->branch_name ?? null)
            : ($branch ?: $room?->getAttribute('branch'));

        return [
            'occupancy' => [
                'id' => $occupancy->id,
                'user_id' => $occupancy->user_id,
                'room_id' => $occupancy->room_id,
                'rental_application_id' => $occupancy->rental_application_id,
                'start_date' => optional($occupancy->start_date)->toDateString(),
                'end_date' => optional($occupancy->end_date)->toDateString(),
                'status' => $occupancy->status,
            ],
            'room' => $room ? [
                'id' => $room->id,
                'room_name' => $room->room_name,
                'price' => $monthlyPrice,
                'room_status' => $room->room_status,
                'is_available' => $room->is_available,
                'branch' => [
                    'id' => is_object($branch) ? ($branch->id ?? null) : null,
                    'branch_name' => $branchName,
                ],
            ] : null,
            'rental_application' => $occupancy->rentalApplication ? [
                'id' => $occupancy->rentalApplication->id,
                'duration' => $occupancy->rentalApplication->duration,
                'status' => $occupancy->rentalApplication->status,
                'payment_status' => $occupancy->rentalApplication->payment_status,
            ] : null,
            'duration_options' => collect(array_keys(self::DURATION_DISCOUNTS))
                ->map(function (int $months) use ($monthlyPrice): array {
                    $amounts = $this->calculatePaymentAmountsFor($monthlyPrice, $months);

                    return [
                        'duration_months' => $months,
                        'label' => $months.' Bulan',
                        'subtotal_amount' => $amounts['subtotal_amount'],
                        'discount_amount' => $amounts['discount_amount'],
                        'gross_amount' => $amounts['gross_amount'],
                    ];
                })
                ->values(),
            'pending_renewal_payment' => $pendingRenewal ? [
                'id' => $pendingRenewal->id,
                'order_id' => $pendingRenewal->order_id,
                'gross_amount' => $pendingRenewal->gross_amount,
                'snap_token' => $pendingRenewal->snap_token,
                'transaction_status' => $pendingRenewal->transaction_status,
                'period_start' => optional($pendingRenewal->period_start)->toDateString(),
                'period_end' => optional($pendingRenewal->period_end)->toDateString(),
            ] : null,
        ];
    }

    private function generateOrderId(RentalApplication $application): string
    {
        return sprintf('KH-%s-%s', $application->id, now()->timestamp);
    }

    private function generateRenewalOrderId(RoomOccupancy $occupancy): string
    {
        return sprintf('KH-REN-%s-%s-%s', $occupancy->id, now()->timestamp, Str::upper(Str::random(6)));
    }

    private function resolveSettlementTime(array $payload): Carbon
    {
        foreach (['settlement_time', 'transaction_time'] as $key) {
            if (! empty($payload[$key])) {
                try {
                    return Carbon::parse($payload[$key]);
                } catch (Throwable) {
                    continue;
                }
            }
        }

        return now();
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
