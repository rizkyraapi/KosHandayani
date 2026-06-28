<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\RoomOccupancy;
use App\Services\MidtransService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
                $room = $application->room_id
                    ? Room::query()->lockForUpdate()->find($application->room_id)
                    : null;
                $application->setRelation('room', $room);

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

                if (! $room) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Kamar untuk pengajuan sewa tidak ditemukan',
                    ], 422));
                }

                if (! $room->is_available || $room->room_status !== 'available') {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Kamar sudah tidak tersedia untuk dibayar',
                    ], 422));
                }

                $conflictingPaymentExists = Payment::query()
                    ->where('payment_category', Payment::CATEGORY_INITIAL_RENT)
                    ->whereIn('transaction_status', ['pending', 'settlement', 'capture'])
                    ->where('rental_application_id', '!=', $application->id)
                    ->whereHas('rentalApplication', fn ($query) => $query->where('room_id', $room->id))
                    ->exists();

                if ($conflictingPaymentExists) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Kamar sedang diproses oleh pembayaran pengajuan lain',
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
        Log::info('Midtrans notification received', $request->only([
            'order_id',
            'transaction_id',
            'transaction_status',
            'status_code',
            'gross_amount',
            'payment_type',
            'fraud_status',
            'settlement_time',
            'transaction_time',
        ]));

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
            'fraud_status' => ['nullable', 'string'],
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
        } catch (HttpResponseException $exception) {
            return $exception->getResponse();
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
            $ownedPayment = Payment::query()
                ->where('order_id', $orderId)
                ->whereHas('rentalApplication', fn ($query) => $query->where('user_id', $request->user()->id))
                ->firstOrFail();
            $statusPayload = $this->midtrans->getTransactionStatus($ownedPayment->order_id);
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
        } catch (HttpResponseException $exception) {
            return $exception->getResponse();
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

    public function receipt(Request $request, Payment $payment)
    {
        if ($response = $this->ensureTenant($request)) {
            return $response;
        }

        $payment->loadMissing([
            'rentalApplication.user',
            'rentalApplication.room.branch',
            'rentalApplication.roomOccupancy',
            'roomOccupancy',
        ]);

        if (! $payment->rentalApplication || (int) $payment->rentalApplication->user_id !== (int) $request->user()->id) {
            abort(404);
        }

        if (! $this->isSuccessfulStatus((string) $payment->transaction_status)) {
            return response()->json([
                'success' => false,
                'message' => 'Bukti pembayaran tersedia setelah pembayaran berhasil.',
            ], 422);
        }

        $logoPath = resource_path('images/koshandayani-logo.svg');
        $logoDataUri = is_file($logoPath)
            ? 'data:image/svg+xml;base64,'.base64_encode((string) file_get_contents($logoPath))
            : null;
        $filename = 'bukti-pembayaran-koshandayani-'.Str::slug((string) $payment->order_id).'.pdf';

        return Pdf::loadView('payments.receipt', [
            'receipt' => $this->receiptData($payment),
            'logoDataUri' => $logoDataUri,
        ])
            ->setPaper('a4', 'portrait')
            ->download($filename);
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

    private function receiptData(Payment $payment): array
    {
        $application = $payment->rentalApplication;
        $tenant = $application?->user;
        $room = $application?->room;
        $branch = $room?->branch;
        $paymentDate = $payment->settlement_time ?? $payment->paid_at ?? $payment->updated_at ?? $payment->created_at;

        return [
            'status' => $payment->transaction_status === 'capture' ? 'Capture' : 'Settlement',
            'transaction_id' => $payment->transaction_id ?: '-',
            'order_id' => $payment->order_id ?: '-',
            'payment_category' => $payment->payment_category === Payment::CATEGORY_RENEWAL
                ? 'Perpanjangan Sewa'
                : 'Pembayaran Awal',
            'tenant_name' => $tenant?->name ?: '-',
            'tenant_email' => $tenant?->email ?: '-',
            'branch_name' => $branch?->branch_name ?? $room?->getAttribute('branch') ?? '-',
            'room_name' => $room?->room_name ?? '-',
            'period_start' => $this->formatReceiptDate($payment->period_start ?? $application?->move_in_date),
            'period_end' => $this->formatReceiptDate($payment->period_end),
            'duration' => $this->formatReceiptDuration($payment, $application),
            'subtotal_amount' => $this->formatReceiptMoney((int) $payment->subtotal_amount),
            'discount_amount' => $this->formatReceiptMoney((int) $payment->discount_amount),
            'gross_amount' => $this->formatReceiptMoney((int) $payment->gross_amount),
            'payment_type' => $this->formatPaymentType($payment->payment_type),
            'paid_at' => $this->formatReceiptDateTime($paymentDate),
            'generated_at' => $this->formatReceiptDateTime(now()),
        ];
    }

    private function formatReceiptMoney(int $amount): string
    {
        return 'Rp '.number_format(max(0, $amount), 0, ',', '.');
    }

    private function formatReceiptDate(mixed $date): string
    {
        if (! $date) {
            return '-';
        }

        try {
            return Carbon::parse($date)->translatedFormat('d M Y');
        } catch (Throwable) {
            return '-';
        }
    }

    private function formatReceiptDateTime(mixed $date): string
    {
        if (! $date) {
            return '-';
        }

        try {
            return Carbon::parse($date)->translatedFormat('d M Y H:i');
        } catch (Throwable) {
            return '-';
        }
    }

    private function formatReceiptDuration(Payment $payment, ?RentalApplication $application): string
    {
        $durationMonths = (int) ($payment->duration_months ?: ($application ? $this->getDurationInMonths($application) : 0));

        return $durationMonths > 0 ? $durationMonths.' Bulan' : '-';
    }

    private function formatPaymentType(?string $paymentType): string
    {
        if (! $paymentType) {
            return '-';
        }

        return Str::of($paymentType)
            ->replace('_', ' ')
            ->title()
            ->toString();
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
        $status = $this->effectiveTransactionStatus($payload, (string) $payment->transaction_status);
        $grossAmount = $payload['gross_amount'] ?? $payment->gross_amount;

        $this->assertMatchingGrossAmount($payment, $grossAmount);

        if ($this->isSuccessfulStatus((string) $payment->transaction_status) && ! $this->isSuccessfulStatus($status)) {
            return $payment->fresh(['rentalApplication.room.branch', 'roomOccupancy']);
        }

        if ($this->isSuccessfulStatus($status)) {
            $this->assertSuccessfulPaymentCanBeApplied($payment);
        }

        $payment->update([
            'transaction_id' => $payload['transaction_id'] ?? $payment->transaction_id,
            'payment_type' => $payload['payment_type'] ?? $payment->payment_type,
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
        return sprintf('KH-%s-%s-%s', $application->id, now()->timestamp, Str::upper(Str::random(6)));
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
        $configuredOrigin = rtrim((string) (config('app.frontend_url') ?: env('FRONTEND_URL')), '/');

        if (! $configuredOrigin || str_contains($configuredOrigin, 'example.com')) {
            return null;
        }

        return $configuredOrigin;
    }

    private function effectiveTransactionStatus(array $payload, string $fallback): string
    {
        $status = (string) ($payload['transaction_status'] ?? $fallback);

        if ($status !== 'capture') {
            return $status;
        }

        return match (strtolower((string) ($payload['fraud_status'] ?? ''))) {
            'accept' => 'capture',
            'deny' => 'deny',
            default => 'pending',
        };
    }

    private function assertMatchingGrossAmount(Payment $payment, mixed $grossAmount): void
    {
        if (! is_numeric($grossAmount) || abs((float) $grossAmount - (float) $payment->gross_amount) > 0.01) {
            Log::warning('Midtrans gross amount mismatch', [
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'expected_amount' => $payment->gross_amount,
                'received_amount' => $grossAmount,
            ]);

            abort(response()->json([
                'success' => false,
                'message' => 'Nominal pembayaran tidak sesuai dengan tagihan',
            ], 422));
        }
    }

    private function assertSuccessfulPaymentCanBeApplied(Payment $payment): void
    {
        if ($payment->payment_category === Payment::CATEGORY_RENEWAL) {
            return;
        }

        $application = $payment->rentalApplication;

        if (! $application?->room_id) {
            abort(response()->json([
                'success' => false,
                'message' => 'Kamar untuk pembayaran tidak ditemukan',
            ], 422));
        }

        if ($application->status !== 'approved') {
            Log::critical('Successful Midtrans transaction belongs to a non-approved application', [
                'payment_id' => $payment->id,
                'rental_application_id' => $application->id,
                'application_status' => $application->status,
            ]);

            abort(response()->json([
                'success' => false,
                'message' => 'Pembayaran memerlukan rekonsiliasi manual karena pengajuan tidak aktif',
            ], 409));
        }

        $room = Room::query()->lockForUpdate()->find($application->room_id);

        if (! $room) {
            abort(response()->json([
                'success' => false,
                'message' => 'Kamar untuk pembayaran tidak ditemukan',
            ], 422));
        }

        $hasConflictingOccupancy = RoomOccupancy::query()
            ->where('room_id', $room->id)
            ->where('status', 'active')
            ->where('rental_application_id', '!=', $application->id)
            ->exists();

        if ($hasConflictingOccupancy) {
            Log::critical('Paid transaction conflicts with an existing active occupancy', [
                'payment_id' => $payment->id,
                'rental_application_id' => $application->id,
                'room_id' => $room->id,
            ]);

            abort(response()->json([
                'success' => false,
                'message' => 'Pembayaran memerlukan rekonsiliasi manual karena kamar sudah ditempati',
            ], 409));
        }
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
