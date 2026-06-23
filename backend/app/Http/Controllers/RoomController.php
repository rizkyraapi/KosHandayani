<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->input('search', ''));
        $searchTerm = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search).'%';

        $rooms = Room::with(['branch', 'facilities'])
            ->when($search !== '', function ($query) use ($searchTerm) {
                $query->where(function ($query) use ($searchTerm) {
                    $query
                        ->where('room_name', 'like', $searchTerm)
                        ->orWhere('gender_type', 'like', $searchTerm)
                        ->orWhere('room_status', 'like', $searchTerm)
                        ->orWhere('description', 'like', $searchTerm)
                        ->orWhere('price', 'like', $searchTerm)
                        ->orWhere('max_guest', 'like', $searchTerm)
                        ->orWhereHas('branch', function ($branchQuery) use ($searchTerm) {
                            $branchQuery
                                ->where('branch_name', 'like', $searchTerm)
                                ->orWhere('city', 'like', $searchTerm)
                                ->orWhere('address', 'like', $searchTerm)
                                ->orWhere('description', 'like', $searchTerm);
                        })
                        ->orWhereHas('facilities', function ($facilityQuery) use ($searchTerm) {
                            $facilityQuery->where('facility_name', 'like', $searchTerm);
                        });
                });
            })
            ->when($request->filled('branch_id'), fn ($query) => $query->where('branch_id', $request->integer('branch_id')))
            ->when($request->filled('gender_type'), fn ($query) => $query->where('gender_type', $request->input('gender_type')))
            ->when($request->filled('room_status'), fn ($query) => $query->where('room_status', $request->input('room_status')))
            ->when($request->filled('price_min'), fn ($query) => $query->where('price', '>=', $request->integer('price_min')))
            ->when($request->filled('price_max'), fn ($query) => $query->where('price', '<=', $request->integer('price_max')))
            ->when($request->filled('exclude_id'), fn ($query) => $query->where('id', '!=', $request->integer('exclude_id')))
            ->when($request->filled('limit'), fn ($query) => $query->limit(min($request->integer('limit'), 24)))
            ->orderByDesc('id')
            ->get()
            ->map(fn (Room $room) => $this->formatRoom($room, false));

        return response()->json($rooms);
    }

    public function show(Room $room)
    {
        return response()->json($this->formatRoom($room->load(['branch', 'facilities', 'images'])));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_name' => ['required', 'string', 'max:255'],
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'gender_type' => ['required', Rule::in(['male', 'female', 'mixed'])],
            'room_status' => ['required', Rule::in(['available', 'occupied', 'maintenance'])],
            'price' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'max_guest' => ['nullable', 'integer', 'min:1', 'max:20'],
            'facilities' => ['nullable', 'array'],
            'facilities.*' => ['string', 'max:255'],
            'images' => ['required', 'array', 'min:4', 'max:10'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ]);

        $room = DB::transaction(function () use ($request, $validated): Room {
            $branch = Branch::findOrFail($validated['branch_id']);

            $roomData = [
                'room_name' => $validated['room_name'],
                'branch_id' => $validated['branch_id'],
                'gender_type' => $validated['gender_type'],
                'price' => $validated['price'],
                'room_status' => $validated['room_status'],
                'description' => $validated['description'] ?? null,
                'max_guest' => $validated['max_guest'] ?? 1,
                'is_available' => $validated['room_status'] === 'available',
            ];

            if (Schema::hasColumn('rooms', 'branch')) {
                $roomData['branch'] = $branch->branch_name;
            }

            $room = Room::create($roomData);

            foreach (array_values(array_filter($validated['facilities'] ?? [])) as $facility) {
                $room->facilities()->create([
                    'facility_name' => $facility,
                ]);
            }

            Storage::disk('public')->makeDirectory('rooms');

            $images = $request->file('images', []);

            foreach ($images as $index => $image) {
                $path = $image->store('rooms', 'public');
                $isPrimary = $index === 0;

                if ($isPrimary) {
                    $room->update(['thumbnail' => $path]);
                }

                $room->images()->create([
                    'image_url' => $path,
                    'is_primary' => $isPrimary,
                ]);
            }

            return $room;
        });

        return response()->json([
            'message' => 'Kamar berhasil dibuat',
            'data' => $this->formatRoom($room->load(['branch', 'facilities', 'images'])),
        ], 201);
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'room_name' => ['required', 'string', 'max:255'],
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'gender_type' => ['required', Rule::in(['male', 'female', 'mixed'])],
            'room_status' => ['required', Rule::in(['available', 'occupied', 'maintenance'])],
            'price' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'max_guest' => ['nullable', 'integer', 'min:1', 'max:20'],
            'facilities' => ['nullable', 'array'],
            'facilities.*' => ['string', 'max:255'],
            'existing_image_ids' => ['nullable', 'array'],
            'existing_image_ids.*' => ['integer', 'exists:room_images,id'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ]);

        $requestedExistingImageIds = collect($validated['existing_image_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->values();
        $existingImageIds = $room->images()
            ->whereIn('id', $requestedExistingImageIds)
            ->pluck('id')
            ->values();
        $newImages = $request->file('images', []);
        $totalImages = $existingImageIds->count() + count($newImages);

        if ($totalImages < 4) {
            $message = trans('validation.min.array', [
                'attribute' => trans('validation.attributes.images'),
                'min' => 4,
            ]);

            return response()->json([
                'message' => $message,
                'errors' => [
                    'images' => [$message],
                ],
            ], 422);
        }

        if ($totalImages > 10) {
            $message = trans('validation.max.array', [
                'attribute' => trans('validation.attributes.images'),
                'max' => 10,
            ]);

            return response()->json([
                'message' => $message,
                'errors' => [
                    'images' => [$message],
                ],
            ], 422);
        }

        $room = DB::transaction(function () use ($validated, $room, $existingImageIds, $newImages): Room {
            $branch = Branch::findOrFail($validated['branch_id']);

            $roomData = [
                'room_name' => $validated['room_name'],
                'branch_id' => $validated['branch_id'],
                'gender_type' => $validated['gender_type'],
                'price' => $validated['price'],
                'room_status' => $validated['room_status'],
                'description' => $validated['description'] ?? null,
                'max_guest' => $validated['max_guest'] ?? 1,
                'is_available' => $validated['room_status'] === 'available',
            ];

            if (Schema::hasColumn('rooms', 'branch')) {
                $roomData['branch'] = $branch->branch_name;
            }

            $room->update($roomData);

            $room->facilities()->delete();
            foreach (array_values(array_filter($validated['facilities'] ?? [])) as $facility) {
                $room->facilities()->create([
                    'facility_name' => $facility,
                ]);
            }

            $imagesToDelete = $room->images()
                ->whereNotIn('id', $existingImageIds)
                ->get();

            foreach ($imagesToDelete as $image) {
                Storage::disk('public')->delete($image->image_url);
                $image->delete();
            }

            $room->images()->update(['is_primary' => false]);
            Storage::disk('public')->makeDirectory('rooms');

            foreach ($newImages as $image) {
                $room->images()->create([
                    'image_url' => $image->store('rooms', 'public'),
                    'is_primary' => false,
                ]);
            }

            $primaryImage = $room->images()->first();
            $room->update([
                'thumbnail' => $primaryImage?->image_url,
            ]);
            $primaryImage?->update(['is_primary' => true]);

            return $room;
        });

        return response()->json([
            'message' => 'Kamar berhasil diperbarui',
            'data' => $this->formatRoom($room->load(['branch', 'facilities', 'images'])),
        ]);
    }

    public function destroy(Room $room)
    {
        if ($room->roomOccupancies()->exists() || $room->rentalApplications()->exists()) {
            return response()->json([
                'message' => 'Kamar yang sudah memiliki riwayat sewa tidak dapat dihapus.',
                'errors' => [
                    'room' => ['Ubah status kamar menjadi maintenance untuk menonaktifkannya tanpa menghapus riwayat.'],
                ],
            ], 422);
        }

        DB::transaction(function () use ($room): void {
            foreach ($room->images as $image) {
                Storage::disk('public')->delete($image->image_url);
            }

            if ($room->thumbnail) {
                Storage::disk('public')->delete($room->thumbnail);
            }

            $room->delete();
        });

        return response()->json([
            'message' => 'Kamar berhasil dihapus',
        ]);
    }

    private function formatRoom(Room $room, bool $includeImages = true): array
    {
        $thumbnailUrl = $this->publicFileUrl($room->thumbnail);
        $images = $includeImages
            ? $room->images
                ->filter(fn ($image) => $this->publicFileUrl($image->image_url) !== null)
                ->map(fn ($image) => [
                    'id' => $image->id,
                    'image_url' => $this->publicFileUrl($image->image_url),
                    'is_primary' => $image->is_primary,
                ])
                ->values()
            : [];
        $branch = $room->relationLoaded('branch')
            ? $room->getRelation('branch')
            : $room->branch()->first();

        return [
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
            'gender_type' => $room->gender_type ?? 'mixed',
            'price' => $room->price,
            'description' => $room->description,
            'thumbnail' => $thumbnailUrl,
            'image_url' => $thumbnailUrl,
            'max_guest' => $room->max_guest ?? 1,
            'room_status' => $room->room_status ?? ($room->is_available ? 'available' : 'occupied'),
            'is_available' => $room->is_available,
            'availability' => $room->is_available ? 'available' : 'occupied',
            'facilities' => $room->facilities->map(fn ($facility) => [
                'id' => $facility->id,
                'facility_name' => $facility->facility_name,
                'name' => $facility->facility_name,
            ])->values(),
            'images' => $images,
            'created_at' => $room->created_at,
            'updated_at' => $room->updated_at,
        ];
    }

    private function publicFileUrl(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        return url('storage/'.$path);
    }
}
