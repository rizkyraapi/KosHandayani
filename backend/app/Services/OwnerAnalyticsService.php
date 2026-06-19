<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\LeaseReminder;
use App\Models\Payment;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\RoomOccupancy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class OwnerAnalyticsService
{
    private const SUCCESS_STATUSES = ['settlement', 'capture'];

    private const FAILED_STATUSES = ['expire', 'cancel', 'deny'];

    public function dashboard(?int $branchId = null): array
    {
        $rooms = $this->roomsQuery($branchId)->with('branch')->get();
        $occupancies = $this->activeOccupanciesQuery($branchId)
            ->with(['user', 'room.branch', 'payments'])
            ->get();
        $payments = $this->paymentsQuery($branchId)
            ->with(['rentalApplication.user', 'rentalApplication.room.branch', 'roomOccupancy'])
            ->get();
        $applications = $this->applicationsQuery($branchId)
            ->with(['user', 'room.branch'])
            ->latest()
            ->get();

        $successfulPayments = $payments->whereIn('transaction_status', self::SUCCESS_STATUSES);
        $monthStart = Carbon::today()->startOfMonth();
        $monthEnd = Carbon::today()->endOfMonth();
        $occupiedRoomIds = $occupancies->pluck('room_id')->filter()->unique();
        $vacantUnits = $rooms
            ->where('room_status', 'available')
            ->whereNotIn('id', $occupiedRoomIds)
            ->count();
        $lifecycleCounts = $this->lifecycleCounts($occupancies);
        $renewalPayments = $payments->where('payment_category', Payment::CATEGORY_RENEWAL);

        return [
            'units' => [
                'total' => $rooms->count(),
                'occupied' => $occupiedRoomIds->count(),
                'vacant' => $vacantUnits,
                'maintenance' => $rooms->where('room_status', 'maintenance')->count(),
                'occupancy_rate' => $this->percentage($occupiedRoomIds->count(), $rooms->count()),
            ],
            'revenue' => [
                'this_month' => (int) $successfulPayments
                    ->filter(fn (Payment $payment) => $this->paymentDate($payment)?->betweenIncluded($monthStart, $monthEnd))
                    ->sum('gross_amount'),
                'total' => (int) $successfulPayments->sum('gross_amount'),
                'renewal' => (int) $successfulPayments
                    ->where('payment_category', Payment::CATEGORY_RENEWAL)
                    ->sum('gross_amount'),
                'initial' => (int) $successfulPayments
                    ->where('payment_category', Payment::CATEGORY_INITIAL_RENT)
                    ->sum('gross_amount'),
            ],
            'tenants' => [
                'active' => $occupancies->pluck('user_id')->filter()->unique()->count(),
                ...$lifecycleCounts,
            ],
            'renewals' => [
                'pending' => $renewalPayments->where('transaction_status', 'pending')->count(),
                'successful' => $renewalPayments->whereIn('transaction_status', self::SUCCESS_STATUSES)->count(),
                'failed' => $renewalPayments->whereIn('transaction_status', self::FAILED_STATUSES)->count(),
            ],
            'applications' => [
                'pending_review' => $applications->where('status', 'pending')->count(),
                'awaiting_payment' => $applications
                    ->where('status', 'approved')
                    ->whereIn('payment_status', ['pending', 'unpaid'])
                    ->count(),
            ],
            'activities' => $this->activities($applications, $payments, $branchId),
            'branches' => $this->branchStatistics($rooms, $occupancies, $successfulPayments, $branchId),
            'attention' => $this->attentionItems($occupancies, $payments),
            'generated_at' => now()->toIso8601String(),
        ];
    }

    public function rooms(?int $branchId = null): array
    {
        $rooms = $this->roomsQuery($branchId)
            ->with([
                'branch',
                'roomOccupancies' => fn ($query) => $query
                    ->where('status', 'active')
                    ->with(['user', 'payments', 'rentalApplication.payments'])
                    ->orderByDesc('end_date'),
            ])
            ->orderBy('room_name')
            ->get();

        return $rooms->map(function (Room $room): array {
            $occupancy = $room->roomOccupancies->first();
            $branch = $this->loadedBranch($room);

            return [
                'id' => $room->id,
                'room_name' => $room->room_name,
                'price' => $room->price,
                'room_status' => $room->room_status,
                'is_available' => $room->is_available,
                'thumbnail' => $room->thumbnail ? url('storage/'.$room->thumbnail) : null,
                'branch' => $branch ? [
                    'id' => $branch->id,
                    'branch_name' => $branch->branch_name,
                    'city' => $branch->city,
                ] : null,
                'occupancy' => $occupancy ? $this->formatOccupancy($occupancy, includeHistory: false) : null,
            ];
        })->values()->all();
    }

    public function tenants(?int $branchId = null): array
    {
        $occupancies = $this->activeOccupanciesQuery($branchId)
            ->with([
                'user',
                'room.branch',
                'rentalApplication.payments',
                'payments' => fn ($query) => $query->latest(),
            ])
            ->orderBy('end_date')
            ->get();

        $reminders = $this->reminderMap($occupancies->pluck('id'));

        return $occupancies->map(function (RoomOccupancy $occupancy) use ($reminders): array {
            $data = $this->formatOccupancy($occupancy, includeHistory: true);
            $data['latest_reminder'] = $reminders->get($occupancy->id);

            return $data;
        })->values()->all();
    }

    public function payments(?int $branchId = null): array
    {
        $payments = $this->paymentsQuery($branchId)
            ->with(['rentalApplication.user', 'rentalApplication.room.branch', 'roomOccupancy'])
            ->latest()
            ->get();

        $successful = $payments->whereIn('transaction_status', self::SUCCESS_STATUSES);
        $pending = $payments->where('transaction_status', 'pending');
        $failed = $payments->whereIn('transaction_status', self::FAILED_STATUSES);

        return [
            'stats' => [
                'total_collected' => (int) $successful->sum('gross_amount'),
                'revenue_initial' => (int) $successful
                    ->where('payment_category', Payment::CATEGORY_INITIAL_RENT)
                    ->sum('gross_amount'),
                'revenue_renewal' => (int) $successful
                    ->where('payment_category', Payment::CATEGORY_RENEWAL)
                    ->sum('gross_amount'),
                'pending_amount' => (int) $pending->sum('gross_amount'),
                'failed_amount' => (int) $failed->sum('gross_amount'),
                'paid_count' => $successful->count(),
                'failed_count' => $failed->count(),
                'pending_count' => $pending->count(),
                'tenant_count' => $payments
                    ->pluck('rentalApplication.user_id')
                    ->filter()
                    ->unique()
                    ->count(),
            ],
            'payments' => $payments->map(fn (Payment $payment) => $this->formatPayment($payment))->values()->all(),
        ];
    }

    public function applicationMonitoring(?int $branchId = null): array
    {
        $applications = $this->applicationsQuery($branchId)
            ->with(['user', 'room.branch', 'payments'])
            ->latest()
            ->get();
        $renewals = $this->paymentsQuery($branchId)
            ->where('payment_category', Payment::CATEGORY_RENEWAL)
            ->with(['rentalApplication.user', 'rentalApplication.room.branch', 'roomOccupancy'])
            ->latest()
            ->get();

        $formatApplication = fn (RentalApplication $application): array => [
            'id' => $application->id,
            'type' => 'initial_rent',
            'status' => $application->status,
            'payment_status' => $application->payment_status,
            'created_at' => optional($application->created_at)->toIso8601String(),
            'updated_at' => optional($application->updated_at)->toIso8601String(),
            'move_in_date' => optional($application->move_in_date)->toDateString(),
            'duration' => $application->duration,
            'tenant' => $application->user?->toProfileArray(),
            'room' => $this->formatRoomReference($application->room),
            'payment_count' => $application->payments->count(),
        ];

        return [
            'stats' => [
                'pending_review' => $applications->where('status', 'pending')->count(),
                'awaiting_payment' => $applications
                    ->where('status', 'approved')
                    ->whereIn('payment_status', ['pending', 'unpaid'])
                    ->count(),
                'payment_success' => $applications->where('payment_status', 'paid')->count(),
                'renewal_pending' => $renewals->where('transaction_status', 'pending')->count(),
            ],
            'new_applications' => $applications
                ->where('status', 'pending')
                ->map($formatApplication)
                ->values()
                ->all(),
            'renewals' => $renewals
                ->map(fn (Payment $payment) => $this->formatPayment($payment))
                ->values()
                ->all(),
            'cancelled' => $applications
                ->where('status', 'cancelled')
                ->map($formatApplication)
                ->values()
                ->all(),
            'rejected' => $applications
                ->where('status', 'rejected')
                ->map($formatApplication)
                ->values()
                ->all(),
            'all_applications' => $applications->map($formatApplication)->values()->all(),
        ];
    }

    public function reports(int $year, ?int $month = null, ?int $branchId = null): array
    {
        $payments = $this->paymentsQuery($branchId)
            ->with(['rentalApplication.user', 'rentalApplication.room.branch', 'roomOccupancy'])
            ->get();
        $periodStart = $month
            ? Carbon::create($year, $month, 1)->startOfMonth()
            : Carbon::create($year, 1, 1)->startOfYear();
        $periodEnd = $month ? $periodStart->copy()->endOfMonth() : $periodStart->copy()->endOfYear();
        $successful = $payments
            ->whereIn('transaction_status', self::SUCCESS_STATUSES)
            ->filter(function (Payment $payment) use ($year, $month): bool {
                $date = $this->paymentDate($payment);

                return $date
                    && $date->year === $year
                    && (! $month || $date->month === $month);
            });
        $periodPayments = $payments->filter(fn (Payment $payment) => $this->paymentDate($payment)?->betweenIncluded($periodStart, $periodEnd));
        $renewalPayments = $periodPayments->where('payment_category', Payment::CATEGORY_RENEWAL);
        $rooms = $this->roomsQuery($branchId)->get();
        $periodOccupancies = RoomOccupancy::query()
            ->with('room')
            ->whereDate('start_date', '<=', $periodEnd)
            ->where(function (Builder $query) use ($periodStart): void {
                $query->whereNull('end_date')->orWhereDate('end_date', '>=', $periodStart);
            })
            ->when($branchId, fn (Builder $query) => $query->whereHas(
                'room',
                fn (Builder $roomQuery) => $roomQuery->where('branch_id', $branchId),
            ))
            ->get();
        $monthlyTrend = collect(range(1, 12))->map(function (int $trendMonth) use ($payments, $year, $branchId, $rooms): array {
            $monthStart = Carbon::create($year, $trendMonth, 1)->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();
            $monthPayments = $payments
                ->whereIn('transaction_status', self::SUCCESS_STATUSES)
                ->filter(fn (Payment $payment) => $this->paymentDate($payment)?->betweenIncluded($monthStart, $monthEnd));
            $occupiedUnits = $this->occupanciesInPeriod($monthStart, $monthEnd, $branchId);

            return [
                'month' => $trendMonth,
                'label' => $monthStart->translatedFormat('M'),
                'revenue' => (int) $monthPayments->sum('gross_amount'),
                'initial_revenue' => (int) $monthPayments
                    ->where('payment_category', Payment::CATEGORY_INITIAL_RENT)
                    ->sum('gross_amount'),
                'renewal_revenue' => (int) $monthPayments
                    ->where('payment_category', Payment::CATEGORY_RENEWAL)
                    ->sum('gross_amount'),
                'occupied_units' => $occupiedUnits,
                'occupancy_rate' => $this->percentage($occupiedUnits, $rooms->count()),
            ];
        });

        $branchRevenue = Branch::query()
            ->when($branchId, fn (Builder $query) => $query->whereKey($branchId))
            ->withCount('rooms')
            ->get()
            ->map(function (Branch $branch) use ($successful, $periodOccupancies): array {
                $revenue = $successful
                    ->filter(fn (Payment $payment) => $payment->rentalApplication?->room?->branch_id === $branch->id)
                    ->sum('gross_amount');
                $occupied = $periodOccupancies
                    ->filter(fn (RoomOccupancy $occupancy) => $occupancy->room?->branch_id === $branch->id)
                    ->pluck('room_id')
                    ->unique()
                    ->count();

                return [
                    'id' => $branch->id,
                    'branch_name' => $branch->branch_name,
                    'revenue' => (int) $revenue,
                    'rooms' => $branch->rooms_count,
                    'occupied_units' => $occupied,
                    'occupancy_rate' => $this->percentage($occupied, $branch->rooms_count),
                ];
            })
            ->values();

        $successfulRenewals = $renewalPayments->whereIn('transaction_status', self::SUCCESS_STATUSES)->count();
        $occupiedUnits = $periodOccupancies->pluck('room_id')->unique()->count();
        $totalRevenue = (int) $successful->sum('gross_amount');
        $periodLabel = $month
            ? Carbon::create($year, $month, 1)->locale('id')->translatedFormat('F Y')
            : 'Tahun '.$year;
        $branchLabel = $branchId
            ? (string) ($branchRevenue->first()['branch_name'] ?? 'Cabang')
            : 'Semua Cabang';

        return [
            'filters' => [
                'year' => $year,
                'month' => $month,
                'branch_id' => $branchId,
                'years' => $this->availableYears(),
                'branches' => Branch::orderBy('branch_name')->get(['id', 'branch_name']),
            ],
            'summary' => [
                'total_revenue' => $totalRevenue,
                'initial_revenue' => (int) $successful
                    ->where('payment_category', Payment::CATEGORY_INITIAL_RENT)
                    ->sum('gross_amount'),
                'renewal_revenue' => (int) $successful
                    ->where('payment_category', Payment::CATEGORY_RENEWAL)
                    ->sum('gross_amount'),
                'occupancy_rate' => $this->percentage(
                    $occupiedUnits,
                    $rooms->count(),
                ),
                'active_tenants' => $periodOccupancies->pluck('user_id')->unique()->count(),
                'renewal_rate' => $this->percentage($successfulRenewals, $renewalPayments->count()),
                'average_revenue_per_room' => $rooms->count() > 0
                    ? (int) round($successful->sum('gross_amount') / $rooms->count())
                    : 0,
            ],
            'revenue_per_branch' => $branchRevenue->all(),
            'monthly_trend' => $monthlyTrend->all(),
            'recent_transactions' => $successful
                ->sortByDesc(fn (Payment $payment) => $this->paymentDate($payment)?->timestamp ?? 0)
                ->take(10)
                ->map(fn (Payment $payment) => $this->formatPayment($payment))
                ->values()
                ->all(),
            'export' => [
                'meta' => [
                    'period_label' => $periodLabel,
                    'branch_label' => $branchLabel,
                    'printed_at' => now()->locale('id')->translatedFormat('d F Y H:i'),
                ],
                'financial_summary' => [
                    'total_income' => $totalRevenue,
                    'total_expenses' => 0,
                    'net_balance' => $totalRevenue,
                ],
                'property_summary' => [
                    'total_rooms' => $rooms->count(),
                    'occupied_rooms' => $occupiedUnits,
                    'vacant_rooms' => max(0, $rooms->count() - $occupiedUnits),
                    'occupancy_rate' => $this->percentage($occupiedUnits, $rooms->count()),
                ],
                'payment_summary' => [
                    'initial_count' => $periodPayments
                        ->where('payment_category', Payment::CATEGORY_INITIAL_RENT)
                        ->count(),
                    'renewal_count' => $renewalPayments->count(),
                    'successful_count' => $periodPayments
                        ->whereIn('transaction_status', self::SUCCESS_STATUSES)
                        ->count(),
                    'pending_count' => $periodPayments->where('transaction_status', 'pending')->count(),
                    'failed_count' => $periodPayments
                        ->whereIn('transaction_status', self::FAILED_STATUSES)
                        ->count(),
                ],
                'transactions' => $periodPayments
                    ->sortByDesc(fn (Payment $payment) => $this->paymentDate($payment)?->timestamp ?? 0)
                    ->map(fn (Payment $payment) => $this->formatExportTransaction($payment))
                    ->values()
                    ->all(),
            ],
        ];
    }

    private function roomsQuery(?int $branchId): Builder
    {
        return Room::query()->when($branchId, fn (Builder $query) => $query->where('branch_id', $branchId));
    }

    private function activeOccupanciesQuery(?int $branchId): Builder
    {
        return RoomOccupancy::query()
            ->where('status', 'active')
            ->when($branchId, fn (Builder $query) => $query->whereHas(
                'room',
                fn (Builder $roomQuery) => $roomQuery->where('branch_id', $branchId),
            ));
    }

    private function paymentsQuery(?int $branchId): Builder
    {
        return Payment::query()->when($branchId, fn (Builder $query) => $query->whereHas(
            'rentalApplication.room',
            fn (Builder $roomQuery) => $roomQuery->where('branch_id', $branchId),
        ));
    }

    private function applicationsQuery(?int $branchId): Builder
    {
        return RentalApplication::query()->when($branchId, fn (Builder $query) => $query->whereHas(
            'room',
            fn (Builder $roomQuery) => $roomQuery->where('branch_id', $branchId),
        ));
    }

    private function lifecycleCounts(Collection $occupancies): array
    {
        $statuses = $occupancies->map(fn (RoomOccupancy $occupancy) => $this->lifecycleStatus($occupancy->end_date));

        return [
            'h30' => $statuses->where('key', 'h30')->count(),
            'h7' => $statuses->where('key', 'h7')->count(),
            'h1' => $statuses->where('key', 'h1')->count(),
            'overdue' => $statuses->where('key', 'overdue')->count(),
        ];
    }

    private function lifecycleStatus(mixed $endDate): array
    {
        if (! $endDate) {
            return ['key' => 'active', 'label' => 'Aktif', 'days_remaining' => null];
        }

        $days = Carbon::today()->diffInDays(Carbon::parse($endDate)->startOfDay(), false);

        if ($days < 0) {
            return ['key' => 'overdue', 'label' => 'Overdue', 'days_remaining' => (int) $days];
        }

        if ($days <= 1) {
            return ['key' => 'h1', 'label' => 'H-1', 'days_remaining' => (int) $days];
        }

        if ($days <= 7) {
            return ['key' => 'h7', 'label' => 'H-7', 'days_remaining' => (int) $days];
        }

        if ($days <= 30) {
            return ['key' => 'h30', 'label' => 'H-30', 'days_remaining' => (int) $days];
        }

        return ['key' => 'active', 'label' => 'Aktif', 'days_remaining' => (int) $days];
    }

    private function renewalStatus(Collection $payments): array
    {
        $latest = $payments
            ->where('payment_category', Payment::CATEGORY_RENEWAL)
            ->sortByDesc('id')
            ->first();

        if (! $latest) {
            return ['key' => 'none', 'label' => 'Belum Ada', 'payment_id' => null];
        }

        if (in_array($latest->transaction_status, self::SUCCESS_STATUSES, true)) {
            return ['key' => 'successful', 'label' => 'Berhasil', 'payment_id' => $latest->id];
        }

        if (in_array($latest->transaction_status, self::FAILED_STATUSES, true)) {
            return ['key' => 'failed', 'label' => 'Gagal', 'payment_id' => $latest->id];
        }

        return ['key' => 'pending', 'label' => 'Pending', 'payment_id' => $latest->id];
    }

    private function formatOccupancy(RoomOccupancy $occupancy, bool $includeHistory): array
    {
        $occupancyPayments = $occupancy->relationLoaded('payments') ? $occupancy->payments : collect();
        $applicationPayments = $occupancy->relationLoaded('rentalApplication')
            && $occupancy->rentalApplication?->relationLoaded('payments')
                ? $occupancy->rentalApplication->payments
                : collect();
        $payments = $applicationPayments
            ->concat($occupancyPayments)
            ->unique('id')
            ->sortByDesc('created_at')
            ->values();
        $lifecycle = $this->lifecycleStatus($occupancy->end_date);
        $start = $occupancy->start_date ? Carbon::parse($occupancy->start_date) : null;
        $end = $occupancy->end_date ? Carbon::parse($occupancy->end_date) : null;
        $totalDays = $start && $end ? max(1, $start->diffInDays($end)) : null;
        $elapsedDays = $start ? max(0, $start->diffInDays(Carbon::today(), false)) : null;
        $progress = $totalDays && $elapsedDays !== null
            ? (int) round(min(100, max(0, ($elapsedDays / $totalDays) * 100)))
            : 0;

        return [
            'id' => $occupancy->id,
            'user_id' => $occupancy->user_id,
            'room_id' => $occupancy->room_id,
            'rental_application_id' => $occupancy->rental_application_id,
            'tenant' => $occupancy->user?->toProfileArray(),
            'room' => $this->formatRoomReference($occupancy->room),
            'start_date' => optional($occupancy->start_date)->toDateString(),
            'end_date' => optional($occupancy->end_date)->toDateString(),
            'status' => $occupancy->status,
            'days_remaining' => $lifecycle['days_remaining'],
            'lifecycle_status' => $lifecycle['key'],
            'lifecycle_label' => $lifecycle['label'],
            'lease_progress' => $progress,
            'renewal_status' => $this->renewalStatus($payments),
            'payments' => $includeHistory
                ? $payments->map(fn (Payment $payment) => $this->formatPayment($payment))->values()->all()
                : [],
        ];
    }

    private function formatPayment(Payment $payment): array
    {
        $application = $payment->rentalApplication;
        $tenant = $application?->user;
        $room = $application?->room;

        return [
            'id' => $payment->id,
            'rental_application_id' => $payment->rental_application_id,
            'room_occupancy_id' => $payment->room_occupancy_id,
            'payment_category' => $payment->payment_category,
            'order_id' => $payment->order_id,
            'transaction_id' => $payment->transaction_id,
            'subtotal_amount' => $payment->subtotal_amount,
            'discount_amount' => $payment->discount_amount,
            'duration_months' => $payment->duration_months,
            'monthly_price' => $payment->monthly_price,
            'period_start' => optional($payment->period_start)->toDateString(),
            'period_end' => optional($payment->period_end)->toDateString(),
            'gross_amount' => $payment->gross_amount,
            'payment_type' => $payment->payment_type,
            'transaction_status' => $payment->transaction_status,
            'paid_at' => optional($payment->paid_at)->toDateTimeString(),
            'settlement_time' => optional($payment->settlement_time)->toDateTimeString(),
            'created_at' => optional($payment->created_at)->toIso8601String(),
            'updated_at' => optional($payment->updated_at)->toIso8601String(),
            'tenant' => $tenant?->toProfileArray(),
            'room' => $this->formatRoomReference($room),
            'rental_application' => $application ? [
                'id' => $application->id,
                'duration' => $application->duration,
                'status' => $application->status,
                'payment_status' => $application->payment_status,
                'move_in_date' => optional($application->move_in_date)->toDateString(),
            ] : null,
        ];
    }

    private function formatExportTransaction(Payment $payment): array
    {
        $application = $payment->rentalApplication;
        $room = $application?->room;
        $status = in_array($payment->transaction_status, self::SUCCESS_STATUSES, true)
            ? 'Lunas'
            : (in_array($payment->transaction_status, self::FAILED_STATUSES, true) ? 'Gagal' : 'Pending');

        return [
            'date' => optional($this->paymentDate($payment))->locale('id')->translatedFormat('d M Y'),
            'tenant_name' => $application?->user?->name ?? 'Penyewa',
            'room_name' => $room?->room_name ?? '-',
            'branch_name' => $room ? ($this->loadedBranch($room)?->branch_name ?? '-') : '-',
            'payment_type' => $payment->payment_category === Payment::CATEGORY_RENEWAL
                ? 'Perpanjangan'
                : 'Pembayaran Awal',
            'amount' => (int) $payment->gross_amount,
            'status' => $status,
        ];
    }

    private function formatRoomReference(?Room $room): ?array
    {
        if (! $room) {
            return null;
        }

        $branch = $this->loadedBranch($room);

        return [
            'id' => $room->id,
            'room_name' => $room->room_name,
            'branch' => $branch ? [
                'id' => $branch->id,
                'branch_name' => $branch->branch_name,
                'city' => $branch->city,
            ] : null,
        ];
    }

    private function loadedBranch(Room $room): ?Branch
    {
        if (! $room->relationLoaded('branch')) {
            $room->load('branch');
        }

        $branch = $room->getRelation('branch');

        return $branch instanceof Branch ? $branch : null;
    }

    private function branchStatistics(
        Collection $rooms,
        Collection $occupancies,
        Collection $payments,
        ?int $branchId = null,
    ): array {
        return Branch::query()
            ->when($branchId, fn (Builder $query) => $query->whereKey($branchId))
            ->orderBy('branch_name')
            ->get()
            ->map(function (Branch $branch) use ($rooms, $occupancies, $payments): array {
                $branchRooms = $rooms->where('branch_id', $branch->id);
                $branchOccupancies = $occupancies->filter(fn (RoomOccupancy $occupancy) => $occupancy->room?->branch_id === $branch->id);
                $occupiedUnits = $branchOccupancies->pluck('room_id')->unique()->count();

                return [
                    'id' => $branch->id,
                    'branch_name' => $branch->branch_name,
                    'room_count' => $branchRooms->count(),
                    'occupied_units' => $occupiedUnits,
                    'occupancy_rate' => $this->percentage($occupiedUnits, $branchRooms->count()),
                    'revenue' => (int) $payments
                        ->filter(fn (Payment $payment) => $payment->rentalApplication?->room?->branch_id === $branch->id)
                        ->sum('gross_amount'),
                    'active_tenants' => $branchOccupancies->pluck('user_id')->unique()->count(),
                ];
            })
            ->values()
            ->all();
    }

    private function activities(Collection $applications, Collection $payments, ?int $branchId = null): array
    {
        $activities = collect();

        foreach ($applications->take(12) as $application) {
            $activities->push([
                'id' => 'application-created-'.$application->id,
                'type' => 'application_created',
                'title' => 'Pengajuan baru',
                'description' => ($application->user?->name ?? 'Penyewa').' mengajukan '.$application->room?->room_name,
                'occurred_at' => optional($application->created_at)->toIso8601String(),
                'href' => '/owner/rental-applications/'.$application->id,
            ]);

            if ($application->approved_at) {
                $activities->push([
                    'id' => 'application-approved-'.$application->id,
                    'type' => 'application_approved',
                    'title' => 'Pengajuan disetujui',
                    'description' => ($application->user?->name ?? 'Penyewa').' - '.$application->room?->room_name,
                    'occurred_at' => optional($application->approved_at)->toIso8601String(),
                    'href' => '/owner/rental-applications/'.$application->id,
                ]);
            }
        }

        foreach ($payments->whereIn('transaction_status', self::SUCCESS_STATUSES)->take(16) as $payment) {
            $isRenewal = $payment->payment_category === Payment::CATEGORY_RENEWAL;
            $activities->push([
                'id' => 'payment-'.$payment->id,
                'type' => $isRenewal ? 'renewal_success' : 'payment_success',
                'title' => $isRenewal ? 'Perpanjangan berhasil' : 'Pembayaran berhasil',
                'description' => ($payment->rentalApplication?->user?->name ?? 'Penyewa').' - '.number_format($payment->gross_amount, 0, ',', '.'),
                'occurred_at' => optional($this->paymentDate($payment))->toIso8601String(),
                'href' => '/owner/rental-applications/'.$payment->rental_application_id,
            ]);
        }

        if (Schema::hasTable('lease_reminders')) {
            LeaseReminder::with(['user', 'roomOccupancy.room'])
                ->when(
                    $branchId,
                    fn (Builder $query) => $query->whereHas(
                        'roomOccupancy.room',
                        fn (Builder $roomQuery) => $roomQuery->where('branch_id', $branchId),
                    ),
                )
                ->latest('sent_at')
                ->take(12)
                ->get()
                ->each(function (LeaseReminder $reminder) use ($activities): void {
                    $activities->push([
                        'id' => 'reminder-'.$reminder->id,
                        'type' => 'reminder_sent',
                        'title' => 'Reminder dikirim',
                        'description' => ($reminder->user?->name ?? 'Penyewa').' - '.$reminder->reminder_type,
                        'occurred_at' => optional($reminder->sent_at)->toIso8601String(),
                        'href' => '/owner/tenants',
                    ]);
                });
        }

        return $activities
            ->filter(fn (array $activity) => filled($activity['occurred_at']))
            ->sortByDesc('occurred_at')
            ->take(12)
            ->values()
            ->all();
    }

    private function attentionItems(Collection $occupancies, Collection $payments): array
    {
        $items = collect();

        foreach ($occupancies as $occupancy) {
            $lifecycle = $this->lifecycleStatus($occupancy->end_date);

            if (! in_array($lifecycle['key'], ['h30', 'h7', 'h1', 'overdue'], true)) {
                continue;
            }

            $items->push([
                'id' => 'occupancy-'.$occupancy->id,
                'type' => $lifecycle['key'],
                'title' => $lifecycle['label'].' - '.($occupancy->user?->name ?? 'Penyewa'),
                'description' => ($occupancy->room?->room_name ?? 'Kamar').' · '.optional($occupancy->end_date)->toDateString(),
                'href' => '/owner/tenants',
                'priority' => match ($lifecycle['key']) {
                    'overdue' => 5,
                    'h1' => 4,
                    'h7' => 3,
                    default => 2,
                },
            ]);
        }

        foreach ($payments as $payment) {
            $isRenewalPending = $payment->payment_category === Payment::CATEGORY_RENEWAL
                && $payment->transaction_status === 'pending';
            $isFailed = in_array($payment->transaction_status, self::FAILED_STATUSES, true);

            if (! $isRenewalPending && ! $isFailed) {
                continue;
            }

            $items->push([
                'id' => 'payment-'.$payment->id,
                'type' => $isRenewalPending ? 'renewal_pending' : 'payment_failed',
                'title' => $isRenewalPending ? 'Renewal pending' : 'Pembayaran gagal',
                'description' => ($payment->rentalApplication?->user?->name ?? 'Penyewa').' · '.($payment->rentalApplication?->room?->room_name ?? 'Kamar'),
                'href' => '/owner/rental-applications/'.$payment->rental_application_id,
                'priority' => $isFailed ? 4 : 3,
            ]);
        }

        return $items->sortByDesc('priority')->take(12)->values()->all();
    }

    private function reminderMap(Collection $occupancyIds): Collection
    {
        if (! Schema::hasTable('lease_reminders') || $occupancyIds->isEmpty()) {
            return collect();
        }

        return LeaseReminder::whereIn('room_occupancy_id', $occupancyIds)
            ->latest('sent_at')
            ->get()
            ->unique('room_occupancy_id')
            ->mapWithKeys(fn (LeaseReminder $reminder) => [
                $reminder->room_occupancy_id => [
                    'id' => $reminder->id,
                    'reminder_type' => $reminder->reminder_type,
                    'channel' => $reminder->channel,
                    'sent_at' => optional($reminder->sent_at)->toIso8601String(),
                ],
            ]);
    }

    private function occupanciesInPeriod(Carbon $start, Carbon $end, ?int $branchId): int
    {
        return RoomOccupancy::query()
            ->whereDate('start_date', '<=', $end)
            ->where(function (Builder $query) use ($start): void {
                $query->whereNull('end_date')->orWhereDate('end_date', '>=', $start);
            })
            ->when($branchId, fn (Builder $query) => $query->whereHas(
                'room',
                fn (Builder $roomQuery) => $roomQuery->where('branch_id', $branchId),
            ))
            ->distinct('room_id')
            ->count('room_id');
    }

    private function availableYears(): array
    {
        $years = Payment::query()
            ->get(['paid_at', 'settlement_time', 'created_at'])
            ->map(fn (Payment $payment) => $this->paymentDate($payment)?->year)
            ->filter()
            ->unique()
            ->sortDesc()
            ->values()
            ->all();

        return $years ?: [(int) now()->year];
    }

    private function paymentDate(Payment $payment): ?Carbon
    {
        $value = $payment->paid_at
            ?? $payment->settlement_time
            ?? $payment->updated_at
            ?? $payment->created_at;

        return $value ? Carbon::parse($value) : null;
    }

    private function percentage(int $value, int $total): float
    {
        return $total > 0 ? round(($value / $total) * 100, 1) : 0.0;
    }
}
