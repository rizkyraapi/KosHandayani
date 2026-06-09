<?php

namespace Tests\Feature;

use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RentalApplicationApprovalPaymentStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_approval_sets_payment_status_to_unpaid(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $application = $this->createRentalApplication();

        $this
            ->actingAs($owner)
            ->putJson('/api/owner/rental-applications/'.$application->id, [
                'status' => 'approved',
                'owner_notes' => 'Disetujui',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.payment_status', 'unpaid');

        $application->refresh();

        $this->assertSame('approved', $application->status);
        $this->assertSame('unpaid', $application->payment_status);
        $this->assertNotNull($application->approved_at);
        $this->assertDatabaseHas('rooms', [
            'id' => $application->room_id,
            'is_available' => true,
            'room_status' => 'available',
        ]);
    }

    public function test_repeated_approval_does_not_refresh_payment_status_or_approved_at(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $approvedAt = now()->subDay();
        $application = $this->createRentalApplication([
            'status' => 'approved',
            'payment_status' => 'unpaid',
            'approved_at' => $approvedAt,
        ]);

        $this
            ->actingAs($owner)
            ->putJson('/api/owner/rental-applications/'.$application->id, [
                'status' => 'approved',
                'owner_notes' => 'Catatan diperbarui',
            ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'unpaid');

        $application->refresh();

        $this->assertSame('Catatan diperbarui', $application->owner_notes);
        $this->assertSame('unpaid', $application->payment_status);
        $this->assertSame($approvedAt->toDateTimeString(), $application->approved_at->toDateTimeString());
    }

    public function test_owner_rejection_resets_payment_status_to_pending(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $application = $this->createRentalApplication([
            'status' => 'approved',
            'payment_status' => 'unpaid',
            'approved_at' => now(),
        ]);

        $this
            ->actingAs($owner)
            ->putJson('/api/owner/rental-applications/'.$application->id, [
                'status' => 'rejected',
                'owner_notes' => 'Dokumen belum sesuai',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.payment_status', 'pending');

        $application->refresh();

        $this->assertSame('rejected', $application->status);
        $this->assertSame('pending', $application->payment_status);
    }

    public function test_owner_cannot_approve_application_when_room_is_unavailable(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $application = $this->createRentalApplication();
        $application->room->update([
            'is_available' => false,
            'room_status' => 'occupied',
        ]);

        $this
            ->actingAs($owner)
            ->putJson('/api/owner/rental-applications/'.$application->id, [
                'status' => 'approved',
                'owner_notes' => 'Disetujui',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Kamar sudah tidak tersedia untuk disetujui');

        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);
    }

    private function createRentalApplication(array $overrides = []): RentalApplication
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = Room::create([
            'room_name' => 'Kamar Approval',
            'branch' => 'Cabang Utama',
            'room_type' => 'single',
            'gender_type' => 'mixed',
            'room_status' => 'available',
            'price' => 1500000,
            'max_guest' => 1,
            'is_available' => true,
        ]);

        return RentalApplication::create(array_merge([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'move_in_date' => '2026-06-10',
            'duration' => '3 Bulan',
            'status' => 'pending',
            'payment_status' => 'pending',
        ], $overrides));
    }
}
