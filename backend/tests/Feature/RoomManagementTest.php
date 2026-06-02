<?php

namespace Tests\Feature;

use App\Models\Branch;
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
        $branch = Branch::create([
            'branch_name' => 'Cabang Setiabudi',
            'city' => 'Jakarta Selatan',
        ]);

        $imagePaths = collect(range(1, 4))->map(function (int $index) {
            $imagePath = tempnam(sys_get_temp_dir(), 'room-photo-');
            file_put_contents(
                $imagePath,
                base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=')
            );

            return new UploadedFile($imagePath, "room-{$index}.png", 'image/png', null, true);
        })->all();

        $response = $this
            ->actingAs($owner)
            ->post('/api/rooms', [
                'room_name' => 'Kamar A-101',
                'branch_id' => $branch->id,
                'room_type' => 'suite',
                'gender_type' => 'mixed',
                'room_status' => 'available',
                'price' => 2500000,
                'description' => 'Kamar suite nyaman.',
                'max_guest' => 2,
                'facilities' => ['Wi-Fi', 'AC'],
                'images' => $imagePaths,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.room_name', 'Kamar A-101')
            ->assertJsonPath('data.branch.branch_name', 'Cabang Setiabudi')
            ->assertJsonPath('data.gender_type', 'mixed')
            ->assertJsonPath('data.room_status', 'available')
            ->assertJsonCount(2, 'data.facilities')
            ->assertJsonCount(4, 'data.images')
            ->assertJsonPath('data.images.0.is_primary', true)
            ->assertJsonPath('data.images.1.is_primary', false)
            ->assertJsonPath('data.thumbnail', fn ($url) => is_string($url) && str_contains($url, '/storage/rooms/'));

        $room = Room::with(['facilities', 'images'])->firstOrFail();

        $this->assertSame('suite', $room->room_type);
        $this->assertSame($branch->id, $room->branch_id);
        $this->assertCount(2, $room->facilities);
        $this->assertCount(4, $room->images);
        $this->assertTrue($room->images->first()->is_primary);
        $this->assertSame($room->images->first()->image_url, $room->thumbnail);
        Storage::disk('public')->assertExists($room->thumbnail);
    }

    public function test_room_list_returns_relationships(): void
    {
        $branch = Branch::create([
            'branch_name' => 'Cabang Margonda',
            'city' => 'Depok',
        ]);

        $room = Room::create([
            'room_name' => 'Kamar B-201',
            'branch_id' => $branch->id,
            'branch' => $branch->branch_name,
            'room_type' => 'single',
            'gender_type' => 'female',
            'room_status' => 'available',
            'price' => 1200000,
            'max_guest' => 1,
            'is_available' => true,
        ]);
        $room->facilities()->create(['facility_name' => 'Wi-Fi']);

        $this
            ->getJson('/api/rooms')
            ->assertOk()
            ->assertJsonPath('0.room_name', 'Kamar B-201')
            ->assertJsonPath('0.branch.branch_name', 'Cabang Margonda')
            ->assertJsonPath('0.gender_type', 'female')
            ->assertJsonPath('0.facilities.0.facility_name', 'Wi-Fi')
            ->assertJsonCount(0, '0.images');
    }

    public function test_room_list_can_search_across_room_branch_and_facility_fields(): void
    {
        $branch = Branch::create([
            'branch_name' => 'Cabang Menteng',
            'city' => 'Jakarta Pusat',
            'address' => 'Dekat stasiun',
            'description' => 'Cabang premium untuk pekerja.',
        ]);

        $matchingRoom = Room::create([
            'room_name' => 'Suite Cendana',
            'branch_id' => $branch->id,
            'branch' => $branch->branch_name,
            'room_type' => 'suite',
            'gender_type' => 'mixed',
            'room_status' => 'available',
            'description' => 'Kamar luas dengan meja kerja.',
            'price' => 2500000,
            'max_guest' => 2,
            'is_available' => true,
        ]);
        $matchingRoom->facilities()->create(['facility_name' => 'Water Heater']);

        Room::create([
            'room_name' => 'Kamar Melati',
            'branch_id' => $branch->id,
            'branch' => $branch->branch_name,
            'room_type' => 'single',
            'gender_type' => 'female',
            'room_status' => 'available',
            'description' => 'Kamar hemat.',
            'price' => 900000,
            'max_guest' => 1,
            'is_available' => true,
        ]);

        $this
            ->getJson('/api/rooms?search=heater')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.room_name', 'Suite Cendana');

        $this
            ->getJson('/api/rooms?search=menteng')
            ->assertOk()
            ->assertJsonCount(2);

        $this
            ->getJson('/api/rooms?search=meja')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.room_name', 'Suite Cendana');
    }

    public function test_owner_can_update_room_with_existing_images(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create(['role' => 'owner']);
        $branch = Branch::create([
            'branch_name' => 'Cabang Tebet',
            'city' => 'Jakarta Selatan',
        ]);
        $room = Room::create([
            'room_name' => 'Kamar Lama',
            'branch_id' => $branch->id,
            'branch' => $branch->branch_name,
            'room_type' => 'single',
            'gender_type' => 'male',
            'room_status' => 'available',
            'price' => 1000000,
            'max_guest' => 1,
            'is_available' => true,
        ]);

        foreach (range(1, 4) as $index) {
            $path = "rooms/existing-{$index}.png";
            Storage::disk('public')->put($path, 'image-content');
            $image = $room->images()->create([
                'image_url' => $path,
                'is_primary' => $index === 1,
            ]);

            if ($index === 1) {
                $room->update(['thumbnail' => $image->image_url]);
            }
        }

        $response = $this
            ->actingAs($owner)
            ->put('/api/rooms/'.$room->id, [
                'room_name' => 'Kamar Baru',
                'branch_id' => $branch->id,
                'room_type' => 'suite',
                'gender_type' => 'mixed',
                'room_status' => 'maintenance',
                'price' => 1750000,
                'description' => 'Deskripsi diperbarui.',
                'max_guest' => 3,
                'facilities' => ['AC', 'Wi-Fi'],
                'existing_image_ids' => $room->images()->pluck('id')->all(),
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.room_name', 'Kamar Baru')
            ->assertJsonPath('data.room_type', 'suite')
            ->assertJsonPath('data.room_status', 'maintenance')
            ->assertJsonPath('data.price', 1750000)
            ->assertJsonCount(2, 'data.facilities')
            ->assertJsonCount(4, 'data.images');

        $room->refresh();

        $this->assertSame('Kamar Baru', $room->room_name);
        $this->assertFalse($room->is_available);
        $this->assertCount(4, $room->images);
    }

    public function test_owner_can_delete_room_and_stored_images(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create(['role' => 'owner']);
        $branch = Branch::create([
            'branch_name' => 'Cabang Kemang',
            'city' => 'Jakarta Selatan',
        ]);
        $room = Room::create([
            'room_name' => 'Kamar Hapus',
            'branch_id' => $branch->id,
            'branch' => $branch->branch_name,
            'room_type' => 'single',
            'gender_type' => 'female',
            'room_status' => 'available',
            'price' => 900000,
            'max_guest' => 1,
            'is_available' => true,
        ]);
        Storage::disk('public')->put('rooms/delete-me.png', 'image-content');
        $room->images()->create([
            'image_url' => 'rooms/delete-me.png',
            'is_primary' => true,
        ]);
        $room->update(['thumbnail' => 'rooms/delete-me.png']);

        $this
            ->actingAs($owner)
            ->delete('/api/rooms/'.$room->id)
            ->assertOk()
            ->assertJsonPath('message', 'Kamar berhasil dihapus');

        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
        Storage::disk('public')->assertMissing('rooms/delete-me.png');
    }
}
