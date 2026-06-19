<?php

namespace Tests\Feature;

use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RentalApplicationCancellationTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_can_cancel_own_pending_application(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $application = $this->createRentalApplication($tenant);

        $this
            ->actingAs($tenant)
            ->postJson('/api/my-rental-applications/'.$application->id.'/cancel')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Pengajuan sewa berhasil dibatalkan')
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'user_id' => $tenant->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_tenant_cannot_cancel_non_pending_application(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $application = $this->createRentalApplication($tenant, [
            'status' => 'approved',
            'payment_status' => 'unpaid',
            'approved_at' => now(),
        ]);

        $this
            ->actingAs($tenant)
            ->postJson('/api/my-rental-applications/'.$application->id.'/cancel')
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Pengajuan hanya dapat dibatalkan saat masih menunggu review');

        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'status' => 'approved',
            'payment_status' => 'unpaid',
        ]);
    }

    public function test_owner_cannot_process_cancelled_application(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $tenant = User::factory()->create(['role' => 'tenant']);
        $application = $this->createRentalApplication($tenant, [
            'status' => 'cancelled',
        ]);

        $this
            ->actingAs($owner)
            ->putJson('/api/owner/rental-applications/'.$application->id, [
                'status' => 'approved',
                'owner_notes' => 'Coba approve',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Pengajuan yang dibatalkan tidak dapat diproses');

        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'status' => 'cancelled',
        ]);
    }

    private function createRentalApplication(User $tenant, array $overrides = []): RentalApplication
    {
        $room = Room::create([
            'room_name' => 'Kamar Cancel',
            'branch' => 'Cabang Utama',
            'gender_type' => 'mixed',
            'room_status' => 'available',
            'price' => 800000,
            'max_guest' => 1,
            'is_available' => true,
        ]);

        return RentalApplication::create(array_merge([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'move_in_date' => '2026-06-20',
            'duration' => '1 Bulan',
            'status' => 'pending',
            'payment_status' => 'pending',
        ], $overrides));
    }
}
