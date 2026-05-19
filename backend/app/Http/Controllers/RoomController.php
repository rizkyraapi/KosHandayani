<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
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
        $rooms = Room::with(['branch', 'facilities'])
            ->when($request->filled('branch_id'), fn ($query) => $query->where('branch_id', $request->integer('branch_id')))
            ->when($request->filled('room_type'), fn ($query) => $query->where('room_type', $request->input('room_type')))
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
            'room_type' => ['required', Rule::in(['single', 'double', 'suite'])],
            'gender_type' => ['required', Rule::in(['male', 'female', 'mixed'])],
            'room_status' => ['required', Rule::in(['available', 'occupied', 'maintenance'])],
            'price' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'max_guest' => ['nullable', 'integer', 'min:1', 'max:20'],
            'facilities' => ['nullable', 'array'],
            'facilities.*' => ['string', 'max:255'],
            'images' => ['required', 'array', 'min:4', 'max:10'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $room = DB::transaction(function () use ($request, $validated): Room {
            $branch = Branch::findOrFail($validated['branch_id']);

            $roomData = [
                'room_name' => $validated['room_name'],
                'branch_id' => $validated['branch_id'],
                'room_type' => $validated['room_type'],
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
            'room_type' => $room->room_type ?? 'single',
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
