<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerRentalApplicationIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_index_returns_all_application_statuses_with_relationships(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $branch = Branch::create([
            'branch_name' => 'Cabang Selatan',
            'city' => 'Jakarta',
            'address' => 'Jl. Testing',
        ]);
        $room = Room::create([
            'room_name' => 'Kamar Owner Flow',
            'branch_id' => $branch->id,
            'branch' => $branch->branch_name,
            'room_type' => 'single',
            'gender_type' => 'mixed',
            'room_status' => 'available',
            'price' => 1500000,
            'max_guest' => 1,
            'is_available' => true,
        ]);

        $this->createRentalApplicationRecord($room, 'Tenant Pending', 'pending', 'pending');
        $this->createRentalApplicationRecord($room, 'Tenant Approved', 'approved', 'unpaid');
        $this->createRentalApplicationRecord($room, 'Tenant Rejected', 'rejected', 'pending');

        $response = $this
            ->actingAs($owner)
            ->getJson('/api/owner/rental-applications')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');

        $applications = collect($response->json('data'));

        $this->assertEqualsCanonicalizing(
            ['pending', 'approved', 'rejected'],
            $applications->pluck('status')->all()
        );

        $pending = $applications->firstWhere('status', 'pending');

        $this->assertSame('Tenant Pending', $pending['tenant']['full_name']);
        $this->assertSame('Kamar Owner Flow', $pending['room']['room_name']);
        $this->assertSame('Cabang Selatan', $pending['room']['branch']['branch_name']);
        $this->assertSame('2026-07-01', $pending['move_in_date']);
        $this->assertSame('6 Bulan', $pending['duration']);
    }

    private function createRentalApplicationRecord(Room $room, string $tenantName, string $status, string $paymentStatus): RentalApplication
    {
        $tenant = User::factory()->create([
            'role' => 'tenant',
            'name' => $tenantName,
        ]);

        return RentalApplication::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'move_in_date' => '2026-07-01',
            'duration' => '6 Bulan',
            'status' => $status,
            'payment_status' => $paymentStatus,
        ]);
    }
}
