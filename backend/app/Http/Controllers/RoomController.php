<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::with(['facilities', 'images'])
            ->orderByDesc('id')
            ->get()
            ->map(fn (Room $room) => $this->formatRoom($room));

        return response()->json($rooms);
    }

    public function show(Room $room)
    {
        return response()->json($this->formatRoom($room->load(['facilities', 'images'])));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_name' => ['required', 'string', 'max:255'],
            'room_type' => ['required', Rule::in(['single', 'double', 'suite'])],
            'branch' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'max_guest' => ['nullable', 'integer', 'min:1', 'max:20'],
            'is_available' => ['sometimes', 'boolean'],
            'facilities' => ['nullable', 'array'],
            'facilities.*' => ['string', 'max:255'],
            'images' => ['nullable', 'array', 'max:8'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $room = DB::transaction(function () use ($request, $validated): Room {
            $room = Room::create([
                'room_name' => $validated['room_name'],
                'room_type' => $validated['room_type'],
                'branch' => $validated['branch'],
                'price' => $validated['price'],
                'description' => $validated['description'] ?? null,
                'max_guest' => $validated['max_guest'] ?? 1,
                'is_available' => $request->boolean('is_available', true),
            ]);

            foreach (array_values(array_filter($validated['facilities'] ?? [])) as $facility) {
                $room->facilities()->create([
                    'facility_name' => $facility,
                ]);
            }

            foreach ($request->file('images', []) as $index => $image) {
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
            'data' => $this->formatRoom($room->load(['facilities', 'images'])),
        ], 201);
    }

    private function formatRoom(Room $room): array
    {
        $thumbnailUrl = $room->thumbnail ? url(Storage::url($room->thumbnail)) : null;

        return [
            'id' => $room->id,
            'room_name' => $room->room_name,
            'name' => $room->room_name,
            'room_type' => $room->room_type ?? 'single',
            'branch' => $room->branch,
            'price' => $room->price,
            'description' => $room->description,
            'thumbnail' => $thumbnailUrl,
            'image_url' => $thumbnailUrl,
            'max_guest' => $room->max_guest ?? 1,
            'is_available' => $room->is_available,
            'availability' => $room->is_available ? 'available' : 'occupied',
            'facilities' => $room->facilities->map(fn ($facility) => [
                'id' => $facility->id,
                'facility_name' => $facility->facility_name,
                'name' => $facility->facility_name,
            ])->values(),
            'images' => $room->images->map(fn ($image) => [
                'id' => $image->id,
                'image_url' => url(Storage::url($image->image_url)),
                'is_primary' => $image->is_primary,
            ])->values(),
            'created_at' => $room->created_at,
            'updated_at' => $room->updated_at,
        ];
    }
}
