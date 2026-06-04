<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_can_create_midtrans_snap_payment_for_approved_application(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('createSnapToken')
            ->once()
            ->andReturn('snap-token-123');
        $this->app->instance(MidtransService::class, $midtrans);
        $token = $tenant->createToken('auth_token')->plainTextToken;

        $response = $this
            ->withToken($token)
            ->postJson('/api/payments/create', [
                'rental_application_id' => $application->id,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('snap_token', 'snap-token-123')
            ->assertJsonPath('order_id', fn ($orderId) => str_starts_with($orderId, 'KH-'.$application->id.'-'));

        $this->assertDatabaseHas('payments', [
            'rental_application_id' => $application->id,
            'gross_amount' => 1500000,
            'snap_token' => 'snap-token-123',
            'transaction_status' => 'pending',
        ]);
    }

    public function test_tenant_cannot_create_payment_for_another_tenants_application(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $otherTenant = User::factory()->create(['role' => 'tenant']);
        $application = $this->createApprovedApplication($otherTenant, $this->createRoom());

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldNotReceive('createSnapToken');
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/create', [
                'rental_application_id' => $application->id,
            ])
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_midtrans_settlement_notification_marks_payment_paid_and_creates_occupancy_once(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'order_id' => 'KH-'.$application->id.'-1234567890',
            'gross_amount' => 1500000,
            'transaction_status' => 'pending',
            'snap_token' => 'snap-token-123',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('isValidNotificationSignature')
            ->twice()
            ->andReturnTrue();
        $this->app->instance(MidtransService::class, $midtrans);

        $payload = [
            'order_id' => $payment->order_id,
            'transaction_status' => 'settlement',
            'signature_key' => 'valid-signature',
            'status_code' => '200',
            'gross_amount' => '1500000.00',
            'transaction_id' => 'midtrans-transaction-1',
            'payment_type' => 'bank_transfer',
        ];

        $this->postJson('/api/payments/notification', $payload)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->postJson('/api/payments/notification', $payload)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'transaction_id' => 'midtrans-transaction-1',
            'payment_type' => 'bank_transfer',
            'transaction_status' => 'settlement',
        ]);

        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'payment_status' => 'paid',
        ]);

        $this->assertDatabaseHas('room_occupancies', [
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'rental_application_id' => $application->id,
            'start_date' => '2026-06-10',
            'end_date' => '2026-09-10',
            'status' => 'active',
        ]);
        $this->assertDatabaseCount('room_occupancies', 1);

        $this->assertDatabaseHas('rooms', [
            'id' => $room->id,
            'is_available' => false,
            'room_status' => 'occupied',
        ]);
    }

    public function test_midtrans_failed_notification_marks_application_payment_status_failed(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'order_id' => 'KH-'.$application->id.'-0987654321',
            'gross_amount' => 1500000,
            'transaction_status' => 'pending',
            'snap_token' => 'snap-token-123',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('isValidNotificationSignature')
            ->once()
            ->andReturnTrue();
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->postJson('/api/payments/notification', [
                'order_id' => $payment->order_id,
                'transaction_status' => 'expire',
                'signature_key' => 'valid-signature',
                'status_code' => '407',
                'gross_amount' => '1500000.00',
                'transaction_id' => 'midtrans-transaction-expired',
                'payment_type' => 'bank_transfer',
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'transaction_status' => 'expire',
        ]);

        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'payment_status' => 'failed',
        ]);
    }

    private function createRoom(): Room
    {
        return Room::create([
            'room_name' => 'Kamar Payment',
            'branch' => 'Cabang Utama',
            'room_type' => 'single',
            'gender_type' => 'mixed',
            'room_status' => 'available',
            'price' => 1500000,
            'max_guest' => 1,
            'is_available' => true,
        ]);
    }

    private function createApprovedApplication(User $tenant, Room $room): RentalApplication
    {
        return RentalApplication::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'move_in_date' => '2026-06-10',
            'duration' => '3 Bulan',
            'status' => 'approved',
            'payment_status' => 'unpaid',
            'approved_at' => now(),
        ]);
    }
}
