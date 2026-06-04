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
        ])->load(['user', 'room.branch', 'room.facilities', 'room.images']);

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

        $applications = RentalApplication::with(['room.branch', 'room.facilities'])
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

        $application = RentalApplication::with(['user', 'room.branch', 'room.facilities', 'room.images'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail pengajuan sewa berhasil diambil',
            'data' => $this->formatApplication($application, includeTenant: true, includeRoomDetails: true),
        ]);
    }

    public function ownerIndex(Request $request): JsonResponse
    {
        if ($response = $this->ensureRole($request, 'owner')) {
            return $response;
        }

        $applications = RentalApplication::with(['user', 'room.branch', 'room.facilities'])
            ->latest()
            ->get()
            ->map(fn (RentalApplication $application) => $this->formatApplication($application, includeTenant: true));

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan sewa berhasil diambil',
            'data' => $applications,
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
            $statusChanged = $application->status !== $validated['status'];

            $updates = [
                'owner_notes' => $validated['owner_notes'] ?? $application->owner_notes,
            ];

            if ($statusChanged) {
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

            if ($statusChanged && $validated['status'] === 'approved' && $application->room) {
                $application->room->update([
                    'is_available' => false,
                    'room_status' => 'occupied',
                ]);
            }

            return $application->fresh(['user', 'room.branch', 'room.facilities', 'room.images']);
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
            'room_type' => $room->room_type,
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
