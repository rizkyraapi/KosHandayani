<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRentalApplicationRequest;
use App\Models\RentalApplication;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RentalApplicationController extends Controller
{
    public function store(StoreRentalApplicationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        Storage::disk('public')->makeDirectory('rental_documents');

        $ktpPath = $request->file('ktp_file')->store('rental_documents', 'public');
        $kkPath = $request->file('kk_file')->store('rental_documents', 'public');

        $application = RentalApplication::create([
            'user_id' => $request->user()->id,
            'room_id' => $validated['room_id'],
            'move_in_date' => $validated['move_in_date'],
            'duration' => $validated['duration'],
            'ktp_file' => $ktpPath,
            'kk_file' => $kkPath,
            'status' => 'pending',
            'payment_status' => 'pending',
        ])->load(['user', 'payment', 'roomOccupancy', 'room.branch', 'room.facilities', 'room.images']);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan sewa berhasil dikirim',
            'data' => $this->formatApplication($application, includeTenant: true, includeRoomDetails: true),
        ], 201);
    }

    public function myApplications(Request $request): JsonResponse
    {
        if ($response = $this->ensureRole($request, 'tenant')) {
            return $response;
        }

        $applications = RentalApplication::with(['payment', 'roomOccupancy', 'room.branch', 'room.facilities'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (RentalApplication $application) => $this->formatApplication($application));

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan sewa berhasil diambil',
            'data' => $applications,
        ]);
    }

    public function myApplicationDetail(Request $request, int $id): JsonResponse
    {
        if ($response = $this->ensureRole($request, 'tenant')) {
            return $response;
        }

        $application = RentalApplication::with(['user', 'payment', 'roomOccupancy', 'room.branch', 'room.facilities', 'room.images'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail pengajuan sewa berhasil diambil',
            'data' => $this->formatApplication($application, includeTenant: true, includeRoomDetails: true),
        ]);
    }

    public function cancelMyApplication(Request $request, int $id): JsonResponse
    {
        if ($response = $this->ensureRole($request, 'tenant')) {
            return $response;
        }

        $application = DB::transaction(function () use ($request, $id): RentalApplication {
            $application = RentalApplication::with(['payment', 'roomOccupancy'])
                ->where('user_id', $request->user()->id)
                ->lockForUpdate()
                ->findOrFail($id);

            if ($application->status !== 'pending') {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Pengajuan hanya dapat dibatalkan saat masih menunggu review',
                    'data' => null,
                ], 422));
            }

            $application->update([
                'status' => 'cancelled',
            ]);

            return $application->fresh(['user', 'payment', 'roomOccupancy', 'room.branch', 'room.facilities', 'room.images']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan sewa berhasil dibatalkan',
            'data' => $this->formatApplication($application, includeTenant: true, includeRoomDetails: true),
        ]);
    }

    public function ownerIndex(Request $request): JsonResponse
    {
        if ($response = $this->ensureRole($request, 'owner')) {
            return $response;
        }

        $applications = RentalApplication::with(['user', 'payment', 'room.branch', 'room.facilities'])
            ->latest()
            ->get()
            ->map(fn (RentalApplication $application) => $this->formatApplication($application, includeTenant: true));

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan sewa berhasil diambil',
            'data' => $applications,
        ]);
    }

    public function ownerShow(Request $request, int $id): JsonResponse
    {
        if ($response = $this->ensureRole($request, 'owner')) {
            return $response;
        }

        $application = RentalApplication::with(['user', 'payment', 'payments', 'room.branch', 'room.facilities', 'room.images'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail pengajuan sewa berhasil diambil',
            'data' => $this->formatApplication($application, includeTenant: true, includeRoomDetails: true),
        ]);
    }

    public function ownerUpdate(Request $request, int $id): JsonResponse
    {
        if ($response = $this->ensureRole($request, 'owner')) {
            return $response;
        }

        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'owner_notes' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi keputusan pengajuan sewa gagal',
                'data' => [
                    'errors' => $validator->errors(),
                ],
            ], 422);
        }

        $validated = $validator->validated();

        $application = DB::transaction(function () use ($id, $validated): RentalApplication {
            $application = RentalApplication::with('room')->lockForUpdate()->findOrFail($id);

            if ($application->status === 'cancelled') {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Pengajuan yang dibatalkan tidak dapat diproses',
                    'data' => null,
                ], 422));
            }

            $statusChanged = $application->status !== $validated['status'];

            $updates = [
                'owner_notes' => $validated['owner_notes'] ?? $application->owner_notes,
            ];

            if ($statusChanged) {
                if (
                    $validated['status'] === 'approved'
                    && (! $application->room || ! $application->room->is_available || $application->room->room_status !== 'available')
                ) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Kamar sudah tidak tersedia untuk disetujui',
                        'data' => null,
                    ], 422));
                }

                $updates['status'] = $validated['status'];

                if ($validated['status'] === 'approved') {
                    // approved = menunggu pembayaran tenant; unpaid = siap dibuat transaksi Midtrans.
                    $updates['payment_status'] = 'unpaid';
                    $updates['approved_at'] = now();
                }

                if ($validated['status'] === 'rejected') {
                    $updates['payment_status'] = 'pending';
                }
            }

            $application->update($updates);

            return $application->fresh(['user', 'payment', 'payments', 'room.branch', 'room.facilities', 'room.images']);
        });

        return response()->json([
            'success' => true,
            'message' => $validated['status'] === 'approved'
                ? 'Pengajuan sewa berhasil disetujui'
                : 'Pengajuan sewa berhasil ditolak',
            'data' => $this->formatApplication($application, includeTenant: true, includeRoomDetails: true),
        ]);
    }

    private function ensureRole(Request $request, string $role): ?JsonResponse
    {
        if ($request->user()?->role === $role) {
            return null;
        }

        return response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki akses untuk aksi ini',
            'data' => null,
        ], 403);
    }

    private function formatApplication(
        RentalApplication $application,
        bool $includeTenant = false,
        bool $includeRoomDetails = false,
    ): array {
        $data = [
            'id' => $application->id,
            'user_id' => $application->user_id,
            'room_id' => $application->room_id,
            'move_in_date' => optional($application->move_in_date)->toDateString(),
            'duration' => $application->duration,
            'status' => $application->status,
            'owner_notes' => $application->owner_notes,
            'payment_status' => $application->payment_status,
            'approved_at' => $application->approved_at,
            'paid_at' => $application->paid_at,
            'ktp_file' => $application->ktp_file,
            'ktp_file_url' => $this->publicFileUrl($application->ktp_file),
            'kk_file' => $application->kk_file,
            'kk_file_url' => $this->publicFileUrl($application->kk_file),
            'created_at' => $application->created_at,
            'updated_at' => $application->updated_at,
            'room' => $application->room
                ? $this->formatRoom($application->room, $includeRoomDetails)
                : null,
        ];

        if ($application->relationLoaded('payment')) {
            $payment = $application->getRelation('payment');
            $data['payment'] = $payment ? [
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
                'snap_token' => $payment->snap_token,
                'paid_at' => optional($payment->paid_at)->toDateTimeString(),
                'settlement_time' => optional($payment->settlement_time)->toDateTimeString(),
                'created_at' => $payment->created_at,
                'updated_at' => $payment->updated_at,
            ] : null;
        }

        if ($application->relationLoaded('payments')) {
            $data['payment_history'] = $application->payments
                ->sortByDesc('created_at')
                ->map(fn ($payment) => [
                    'id' => $payment->id,
                    'payment_category' => $payment->payment_category,
                    'order_id' => $payment->order_id,
                    'gross_amount' => $payment->gross_amount,
                    'transaction_status' => $payment->transaction_status,
                    'period_start' => optional($payment->period_start)->toDateString(),
                    'period_end' => optional($payment->period_end)->toDateString(),
                    'paid_at' => optional($payment->paid_at)->toDateTimeString(),
                    'created_at' => optional($payment->created_at)->toIso8601String(),
                ])
                ->values();
        }

        if ($includeTenant) {
            $timeline = collect([
                [
                    'key' => 'submitted',
                    'label' => 'Pengajuan dibuat',
                    'occurred_at' => optional($application->created_at)->toIso8601String(),
                    'status' => 'completed',
                ],
            ]);

            if ($application->approved_at) {
                $timeline->push([
                    'key' => 'approved',
                    'label' => 'Pengajuan disetujui',
                    'occurred_at' => optional($application->approved_at)->toIso8601String(),
                    'status' => 'completed',
                ]);
            }

            if (in_array($application->status, ['rejected', 'cancelled'], true)) {
                $timeline->push([
                    'key' => $application->status,
                    'label' => $application->status === 'cancelled' ? 'Pengajuan dibatalkan' : 'Pengajuan ditolak',
                    'occurred_at' => optional($application->updated_at)->toIso8601String(),
                    'status' => 'completed',
                ]);
            }

            if ($application->paid_at) {
                $timeline->push([
                    'key' => 'paid',
                    'label' => 'Pembayaran awal berhasil',
                    'occurred_at' => optional($application->paid_at)->toIso8601String(),
                    'status' => 'completed',
                ]);
            }

            if ($application->relationLoaded('payments')) {
                $application->payments
                    ->where('payment_category', \App\Models\Payment::CATEGORY_RENEWAL)
                    ->whereIn('transaction_status', ['settlement', 'capture'])
                    ->each(fn ($payment) => $timeline->push([
                        'key' => 'renewal-'.$payment->id,
                        'label' => 'Perpanjangan berhasil',
                        'occurred_at' => optional($payment->paid_at ?? $payment->updated_at)->toIso8601String(),
                        'status' => 'completed',
                    ]));
            }

            $data['status_history'] = $timeline
                ->filter(fn (array $item) => filled($item['occurred_at']))
                ->sortBy('occurred_at')
                ->values();
        }

        if ($application->relationLoaded('roomOccupancy')) {
            $occupancy = $application->getRelation('roomOccupancy');
            $data['room_occupancy'] = $occupancy ? [
                'id' => $occupancy->id,
                'room_occupancy_id' => $occupancy->id,
                'user_id' => $occupancy->user_id,
                'room_id' => $occupancy->room_id,
                'rental_application_id' => $occupancy->rental_application_id,
                'start_date' => optional($occupancy->start_date)->toDateString(),
                'end_date' => optional($occupancy->end_date)->toDateString(),
                'status' => $occupancy->status,
            ] : null;
        }

        if ($includeTenant) {
            $data['tenant'] = $application->user
                ? $application->user->toProfileArray()
                : null;
        }

        return $data;
    }

    private function formatRoom(Room $room, bool $includeDetails = false): array
    {
        $thumbnailUrl = $this->publicFileUrl($room->thumbnail);
        $branch = $room->relationLoaded('branch') ? $room->getRelation('branch') : null;

        $data = [
            'id' => $room->id,
            'room_name' => $room->room_name,
            'name' => $room->room_name,
            'branch_id' => $room->branch_id,
            'branch' => $branch ? [
                'id' => $branch->id,
                'branch_name' => $branch->branch_name,
                'city' => $branch->city,
                'address' => $branch->address,
                'description' => $branch->description,
            ] : null,
            'gender_type' => $room->gender_type,
            'price' => $room->price,
            'thumbnail' => $thumbnailUrl,
            'image_url' => $thumbnailUrl,
            'room_status' => $room->room_status,
            'is_available' => $room->is_available,
            'availability' => $room->is_available ? 'available' : 'occupied',
        ];

        if ($includeDetails) {
            $data['description'] = $room->description;
            $data['max_guest'] = $room->max_guest;
            $data['facilities'] = $room->facilities->map(fn ($facility) => [
                'id' => $facility->id,
                'facility_name' => $facility->facility_name,
                'name' => $facility->facility_name,
            ])->values();
            $data['images'] = $room->images->map(fn ($image) => [
                'id' => $image->id,
                'image_url' => $this->publicFileUrl($image->image_url),
                'is_primary' => $image->is_primary,
            ])->values();
        }

        return $data;
    }

    private function publicFileUrl(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        return url('storage/'.$path);
    }
}
