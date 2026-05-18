<?php

namespace Tests\Feature;

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RoomManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_room_with_facilities_and_images(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create(['role' => 'owner']);

        $imagePath = tempnam(sys_get_temp_dir(), 'room-photo-');
        file_put_contents(
            $imagePath,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=')
        );

        $response = $this
            ->actingAs($owner)
            ->post('/api/rooms', [
                'room_name' => 'Kamar A-101',
                'room_type' => 'suite',
                'branch' => 'Cabang Setiabudi',
                'price' => 2500000,
                'description' => 'Kamar suite nyaman.',
                'max_guest' => 2,
                'is_available' => true,
                'facilities' => ['Wi-Fi', 'AC'],
                'images' => [
                    new UploadedFile($imagePath, 'room.png', 'image/png', null, true),
                ],
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.room_name', 'Kamar A-101')
            ->assertJsonCount(2, 'data.facilities')
            ->assertJsonCount(1, 'data.images')
            ->assertJsonPath('data.thumbnail', fn ($url) => is_string($url) && str_contains($url, '/storage/rooms/'));

        $room = Room::with(['facilities', 'images'])->firstOrFail();

        $this->assertSame('suite', $room->room_type);
        $this->assertCount(2, $room->facilities);
        $this->assertCount(1, $room->images);
        Storage::disk('public')->assertExists($room->thumbnail);
    }

    public function test_room_list_returns_relationships(): void
    {
        $room = Room::create([
            'room_name' => 'Kamar B-201',
            'room_type' => 'single',
            'branch' => 'Cabang Margonda',
            'price' => 1200000,
            'max_guest' => 1,
            'is_available' => true,
        ]);
        $room->facilities()->create(['facility_name' => 'Wi-Fi']);

        $this
            ->getJson('/api/rooms')
            ->assertOk()
            ->assertJsonPath('0.room_name', 'Kamar B-201')
            ->assertJsonPath('0.facilities.0.facility_name', 'Wi-Fi');
    }
}
