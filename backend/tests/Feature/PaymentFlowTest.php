<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\RoomOccupancy;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_midtrans_notification_route_is_public_post_only(): void
    {
        $this
            ->getJson('/api/payments/notification')
            ->assertMethodNotAllowed();

        $this
            ->postJson('/api/payments/notification', [])
            ->assertUnprocessable()
            ->assertJsonPath('success', false);
    }

    public function test_tenant_can_create_midtrans_snap_payment_for_approved_application(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('createSnapToken')
            ->once()
            ->with(Mockery::on(function (array $payload) use ($application, $room): bool {
                return str_starts_with($payload['transaction_details']['order_id'], 'KH-'.$application->id.'-')
                    && $payload['transaction_details']['gross_amount'] === 4400000
                    && $payload['item_details'][0]['id'] === 'ROOM-'.$room->id
                    && $payload['item_details'][0]['price'] === 1500000
                    && $payload['item_details'][0]['quantity'] === 3
                    && $payload['item_details'][1]['id'] === 'DISC-3M'
                    && $payload['item_details'][1]['price'] === -100000
                    && $payload['item_details'][1]['quantity'] === 1
                    && $this->payloadItemTotal($payload['item_details']) === $payload['transaction_details']['gross_amount']
                    && $payload['callbacks']['finish'] === 'http://localhost:3000/tenant/rental-applications/'.$application->id;
            }))
            ->andReturn('snap-token-123');
        $this->app->instance(MidtransService::class, $midtrans);
        $token = $tenant->createToken('auth_token')->plainTextToken;

        $response = $this
            ->withToken($token)
            ->withHeader('Origin', 'http://localhost:3000')
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
            'subtotal_amount' => 4500000,
            'discount_amount' => 100000,
            'gross_amount' => 4400000,
            'snap_token' => 'snap-token-123',
            'transaction_status' => 'pending',
        ]);
    }

    #[DataProvider('durationDiscountCases')]
    public function test_payment_amounts_apply_duration_discount_rules(
        string $duration,
        int $durationMonths,
        int $subtotalAmount,
        int $discountAmount,
        int $grossAmount,
    ): void {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom(500000);
        $application = $this->createApprovedApplication($tenant, $room, $duration);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('createSnapToken')
            ->once()
            ->with(Mockery::on(function (array $payload) use ($room, $durationMonths, $discountAmount, $grossAmount): bool {
                $hasExpectedDiscountItem = $discountAmount === 0
                    ? count($payload['item_details']) === 1
                    : (
                        count($payload['item_details']) === 2
                        && $payload['item_details'][1]['price'] === -$discountAmount
                        && $payload['item_details'][1]['quantity'] === 1
                    );

                return $payload['transaction_details']['gross_amount'] === $grossAmount
                    && $payload['item_details'][0]['id'] === 'ROOM-'.$room->id
                    && $payload['item_details'][0]['price'] === 500000
                    && $payload['item_details'][0]['quantity'] === $durationMonths
                    && $hasExpectedDiscountItem
                    && $this->payloadItemTotal($payload['item_details']) === $grossAmount;
            }))
            ->andReturn('snap-token-'.$durationMonths);
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/create', [
                'rental_application_id' => $application->id,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('payments', [
            'rental_application_id' => $application->id,
            'subtotal_amount' => $subtotalAmount,
            'discount_amount' => $discountAmount,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'pending',
        ]);
    }

    public function test_tenant_can_retry_failed_payment_with_new_midtrans_order(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);
        $application->update(['payment_status' => 'failed']);
        Payment::create([
            'rental_application_id' => $application->id,
            'order_id' => 'OLD-ORDER-'.$application->id,
            'gross_amount' => 4500000,
            'transaction_status' => 'expire',
            'snap_token' => 'old-snap-token',
            'transaction_id' => 'old-transaction',
            'payment_type' => 'bank_transfer',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('createSnapToken')
            ->once()
            ->with(Mockery::on(function (array $payload) use ($application): bool {
                return str_starts_with($payload['transaction_details']['order_id'], 'KH-'.$application->id.'-')
                    && $payload['transaction_details']['order_id'] !== 'OLD-ORDER-'.$application->id
                    && $payload['transaction_details']['gross_amount'] === 4400000
                    && $payload['item_details'][0]['quantity'] === 3
                    && $payload['item_details'][1]['price'] === -100000
                    && $this->payloadItemTotal($payload['item_details']) === $payload['transaction_details']['gross_amount'];
            }))
            ->andReturn('retry-snap-token');
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/create', [
                'rental_application_id' => $application->id,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('snap_token', 'retry-snap-token');

        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'payment_status' => 'unpaid',
        ]);
        $this->assertDatabaseHas('payments', [
            'rental_application_id' => $application->id,
            'subtotal_amount' => 4500000,
            'discount_amount' => 100000,
            'gross_amount' => 4400000,
            'snap_token' => 'retry-snap-token',
            'transaction_id' => null,
            'payment_type' => null,
            'transaction_status' => 'pending',
        ]);
        $this->assertDatabaseMissing('payments', [
            'rental_application_id' => $application->id,
            'order_id' => 'OLD-ORDER-'.$application->id,
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

    public function test_tenant_cannot_create_payment_when_room_is_no_longer_available(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);
        $room->update([
            'is_available' => false,
            'room_status' => 'occupied',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldNotReceive('createSnapToken');
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/create', [
                'rental_application_id' => $application->id,
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Kamar sudah tidak tersedia untuk dibayar');
    }

    public function test_midtrans_settlement_notification_marks_payment_paid_and_creates_occupancy_once(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'order_id' => 'KH-'.$application->id.'-1234567890',
            'subtotal_amount' => 4500000,
            'discount_amount' => 100000,
            'gross_amount' => 4400000,
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
            'gross_amount' => '4400000.00',
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
            'status' => 'active',
        ]);
        $occupancy = RoomOccupancy::first();
        $this->assertSame('2026-06-10', $occupancy?->start_date?->toDateString());
        $this->assertSame('2026-09-10', $occupancy?->end_date?->toDateString());
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
            'subtotal_amount' => 4500000,
            'discount_amount' => 100000,
            'gross_amount' => 4400000,
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
                'gross_amount' => '4400000.00',
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

    public function test_midtrans_notification_rejects_mismatched_gross_amount(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'order_id' => 'KH-'.$application->id.'-amount-check',
            'subtotal_amount' => 4500000,
            'discount_amount' => 100000,
            'gross_amount' => 4400000,
            'transaction_status' => 'pending',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('isValidNotificationSignature')->once()->andReturnTrue();
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->postJson('/api/payments/notification', [
                'order_id' => $payment->order_id,
                'transaction_status' => 'settlement',
                'signature_key' => 'valid-signature',
                'status_code' => '200',
                'gross_amount' => '1.00',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Nominal pembayaran tidak sesuai dengan tagihan');

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'gross_amount' => 4400000,
            'transaction_status' => 'pending',
        ]);
        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'payment_status' => 'unpaid',
        ]);
        $this->assertDatabaseCount('room_occupancies', 0);
    }

    public function test_settlement_for_non_approved_application_requires_manual_reconciliation(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);
        $application->update(['status' => 'rejected', 'payment_status' => 'pending']);
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'order_id' => 'KH-'.$application->id.'-legacy-rejected',
            'subtotal_amount' => 4500000,
            'discount_amount' => 100000,
            'gross_amount' => 4400000,
            'transaction_status' => 'pending',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('isValidNotificationSignature')->once()->andReturnTrue();
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->postJson('/api/payments/notification', [
                'order_id' => $payment->order_id,
                'transaction_status' => 'settlement',
                'signature_key' => 'valid-signature',
                'status_code' => '200',
                'gross_amount' => '4400000.00',
            ])
            ->assertStatus(409)
            ->assertJsonPath('message', 'Pembayaran memerlukan rekonsiliasi manual karena pengajuan tidak aktif');

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'transaction_status' => 'pending',
        ]);
        $this->assertDatabaseCount('room_occupancies', 0);
    }

    public function test_successful_payment_cannot_regress_from_delayed_failed_notification(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createOccupiedRoom();
        $application = $this->createPaidApplication($tenant, $room);
        $occupancy = $this->createActiveOccupancy($tenant, $room, $application);
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'room_occupancy_id' => $occupancy->id,
            'order_id' => 'KH-'.$application->id.'-settled',
            'subtotal_amount' => 4500000,
            'discount_amount' => 100000,
            'gross_amount' => 4400000,
            'transaction_status' => 'settlement',
            'paid_at' => now(),
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('isValidNotificationSignature')->once()->andReturnTrue();
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->postJson('/api/payments/notification', [
                'order_id' => $payment->order_id,
                'transaction_status' => 'expire',
                'signature_key' => 'valid-signature',
                'status_code' => '407',
                'gross_amount' => '4400000.00',
            ])
            ->assertOk()
            ->assertJsonPath('payment.transaction_status', 'settlement');

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'transaction_status' => 'settlement',
        ]);
        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'payment_status' => 'paid',
        ]);
    }

    public function test_capture_with_challenge_fraud_status_remains_pending(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'order_id' => 'KH-'.$application->id.'-capture-challenge',
            'subtotal_amount' => 4500000,
            'discount_amount' => 100000,
            'gross_amount' => 4400000,
            'transaction_status' => 'pending',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('isValidNotificationSignature')->once()->andReturnTrue();
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->postJson('/api/payments/notification', [
                'order_id' => $payment->order_id,
                'transaction_status' => 'capture',
                'fraud_status' => 'challenge',
                'signature_key' => 'valid-signature',
                'status_code' => '200',
                'gross_amount' => '4400000.00',
            ])
            ->assertOk()
            ->assertJsonPath('payment.transaction_status', 'pending');

        $this->assertDatabaseCount('room_occupancies', 0);
        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'payment_status' => 'unpaid',
        ]);
    }

    public function test_tenant_can_sync_successful_payment_status_after_snap_callback(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = $this->createApprovedApplication($tenant, $room);
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'order_id' => 'KH-'.$application->id.'-sync-success',
            'subtotal_amount' => 4500000,
            'discount_amount' => 100000,
            'gross_amount' => 4400000,
            'transaction_status' => 'pending',
            'snap_token' => 'snap-token-sync',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('getTransactionStatus')
            ->once()
            ->with($payment->order_id)
            ->andReturn([
                'order_id' => $payment->order_id,
                'transaction_status' => 'settlement',
                'gross_amount' => '4400000.00',
                'transaction_id' => 'midtrans-sync-transaction',
                'payment_type' => 'bank_transfer',
            ]);
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/sync-status', [
                'order_id' => $payment->order_id,
            ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.transaction_status', 'settlement');

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'transaction_status' => 'settlement',
            'transaction_id' => 'midtrans-sync-transaction',
            'payment_type' => 'bank_transfer',
        ]);
        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'payment_status' => 'paid',
        ]);
        $this->assertDatabaseHas('room_occupancies', [
            'rental_application_id' => $application->id,
            'status' => 'active',
        ]);
        $this->assertDatabaseHas('rooms', [
            'id' => $room->id,
            'is_available' => false,
            'room_status' => 'occupied',
        ]);
    }

    public function test_tenant_cannot_sync_another_tenants_order(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $otherTenant = User::factory()->create(['role' => 'tenant']);
        $application = $this->createApprovedApplication($otherTenant, $this->createRoom());
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'order_id' => 'KH-'.$application->id.'-private-sync',
            'subtotal_amount' => 4500000,
            'discount_amount' => 100000,
            'gross_amount' => 4400000,
            'transaction_status' => 'pending',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldNotReceive('getTransactionStatus');
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/sync-status', [
                'order_id' => $payment->order_id,
            ])
            ->assertNotFound()
            ->assertJsonPath('message', 'Pembayaran tidak ditemukan');
    }

    public function test_tenant_can_create_midtrans_snap_payment_for_lease_renewal(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createOccupiedRoom(500000);
        $application = $this->createPaidApplication($tenant, $room);
        $occupancy = $this->createActiveOccupancy($tenant, $room, $application);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('createSnapToken')
            ->once()
            ->with(Mockery::on(function (array $payload) use ($occupancy, $room): bool {
                return str_starts_with($payload['transaction_details']['order_id'], 'KH-REN-'.$occupancy->id.'-')
                    && $payload['transaction_details']['gross_amount'] === 1400000
                    && $payload['item_details'][0]['id'] === 'RENEWAL-ROOM-'.$room->id
                    && $payload['item_details'][0]['price'] === 500000
                    && $payload['item_details'][0]['quantity'] === 3
                    && $payload['item_details'][1]['id'] === 'RENEWAL-DISC-3M'
                    && $payload['item_details'][1]['price'] === -100000
                    && $payload['callbacks']['finish'] === 'http://localhost:3000/tenant/perpanjang-sewa'
                    && $this->payloadItemTotal($payload['item_details']) === $payload['transaction_details']['gross_amount'];
            }))
            ->andReturn('renewal-snap-token');
        $this->app->instance(MidtransService::class, $midtrans);

        $response = $this
            ->actingAs($tenant)
            ->withHeader('Origin', 'http://localhost:3000')
            ->postJson('/api/payments/renewal/create', [
                'duration_months' => 3,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('snap_token', 'renewal-snap-token')
            ->assertJsonPath('payment.payment_category', Payment::CATEGORY_RENEWAL);

        $this->assertDatabaseHas('payments', [
            'rental_application_id' => $application->id,
            'room_occupancy_id' => $occupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'subtotal_amount' => 1500000,
            'discount_amount' => 100000,
            'duration_months' => 3,
            'monthly_price' => 500000,
            'gross_amount' => 1400000,
            'snap_token' => 'renewal-snap-token',
            'transaction_status' => 'pending',
        ]);
        $renewalPayment = Payment::where('payment_category', Payment::CATEGORY_RENEWAL)->first();
        $this->assertSame('2026-09-11', $renewalPayment?->period_start?->toDateString());
        $this->assertSame('2026-12-11', $renewalPayment?->period_end?->toDateString());
    }

    public function test_tenant_payment_and_application_endpoints_use_payment_category_consistently(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createOccupiedRoom(500000);
        $application = $this->createPaidApplication($tenant, $room);
        $occupancy = $this->createActiveOccupancy($tenant, $room, $application);

        Payment::create([
            'rental_application_id' => $application->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'KH-'.$application->id.'-initial-category',
            'subtotal_amount' => 1500000,
            'discount_amount' => 100000,
            'duration_months' => 3,
            'monthly_price' => 500000,
            'gross_amount' => 1400000,
            'transaction_status' => 'settlement',
            'paid_at' => now(),
        ]);
        Payment::create([
            'rental_application_id' => $application->id,
            'room_occupancy_id' => $occupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'KH-REN-'.$occupancy->id.'-category',
            'subtotal_amount' => 500000,
            'discount_amount' => 0,
            'duration_months' => 1,
            'monthly_price' => 500000,
            'period_start' => '2026-09-11',
            'period_end' => '2026-10-11',
            'gross_amount' => 500000,
            'transaction_status' => 'settlement',
            'paid_at' => now(),
        ]);

        $this
            ->actingAs($tenant)
            ->getJson('/api/my-rental-applications')
            ->assertOk()
            ->assertJsonPath('data.0.payment.payment_category', Payment::CATEGORY_INITIAL_RENT);

        $this
            ->actingAs($tenant)
            ->getJson('/api/my-payments')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['payment_category' => Payment::CATEGORY_INITIAL_RENT])
            ->assertJsonFragment(['payment_category' => Payment::CATEGORY_RENEWAL]);
    }

    public function test_tenant_can_load_renewal_context_using_payment_category(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createOccupiedRoom(500000);
        $application = $this->createPaidApplication($tenant, $room);
        $occupancy = $this->createActiveOccupancy($tenant, $room, $application);

        $this
            ->actingAs($tenant)
            ->getJson('/api/payments/renewal-context')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.occupancy.id', $occupancy->id)
            ->assertJsonPath('data.room.id', $room->id)
            ->assertJsonPath('data.duration_options.1.duration_months', 3)
            ->assertJsonPath('data.duration_options.1.gross_amount', 1400000)
            ->assertJsonPath('data.pending_renewal_payment', null);
    }

    #[DataProvider('durationDiscountCases')]
    public function test_renewal_payment_amounts_apply_duration_discount_rules(
        string $duration,
        int $durationMonths,
        int $subtotalAmount,
        int $discountAmount,
        int $grossAmount,
    ): void {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createOccupiedRoom(500000);
        $application = $this->createPaidApplication($tenant, $room, $duration);
        $this->createActiveOccupancy($tenant, $room, $application);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('createSnapToken')
            ->once()
            ->with(Mockery::on(function (array $payload) use ($durationMonths, $discountAmount, $grossAmount): bool {
                $hasExpectedDiscountItem = $discountAmount === 0
                    ? count($payload['item_details']) === 1
                    : (
                        count($payload['item_details']) === 2
                        && $payload['item_details'][1]['price'] === -$discountAmount
                    );

                return $payload['transaction_details']['gross_amount'] === $grossAmount
                    && $payload['item_details'][0]['quantity'] === $durationMonths
                    && $hasExpectedDiscountItem
                    && $this->payloadItemTotal($payload['item_details']) === $grossAmount;
            }))
            ->andReturn('renewal-snap-'.$durationMonths);
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/renewal/create', [
                'duration_months' => $durationMonths,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('payments', [
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'subtotal_amount' => $subtotalAmount,
            'discount_amount' => $discountAmount,
            'duration_months' => $durationMonths,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'pending',
        ]);
    }

    public function test_tenant_cannot_create_renewal_when_pending_renewal_payment_exists(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createOccupiedRoom();
        $application = $this->createPaidApplication($tenant, $room);
        $occupancy = $this->createActiveOccupancy($tenant, $room, $application);

        Payment::create([
            'rental_application_id' => $application->id,
            'room_occupancy_id' => $occupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'KH-REN-'.$occupancy->id.'-pending',
            'subtotal_amount' => 1500000,
            'discount_amount' => 0,
            'duration_months' => 1,
            'monthly_price' => 1500000,
            'gross_amount' => 1500000,
            'transaction_status' => 'pending',
            'snap_token' => 'pending-renewal-token',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldNotReceive('createSnapToken');
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/renewal/create', [
                'duration_months' => 1,
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Masih ada pembayaran perpanjangan yang menunggu penyelesaian');
    }

    public function test_midtrans_settlement_for_renewal_extends_active_occupancy_idempotently(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createOccupiedRoom(500000);
        $application = $this->createPaidApplication($tenant, $room);
        $occupancy = $this->createActiveOccupancy($tenant, $room, $application);
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'room_occupancy_id' => $occupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'KH-REN-'.$occupancy->id.'-settlement',
            'subtotal_amount' => 1500000,
            'discount_amount' => 100000,
            'duration_months' => 3,
            'monthly_price' => 500000,
            'period_start' => '2026-09-11',
            'period_end' => '2026-12-11',
            'gross_amount' => 1400000,
            'transaction_status' => 'pending',
            'snap_token' => 'renewal-token-settlement',
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
            'gross_amount' => '1400000.00',
            'transaction_id' => 'midtrans-renewal-transaction',
            'payment_type' => 'bank_transfer',
            'settlement_time' => '2026-09-01 10:15:00',
        ];

        $this->postJson('/api/payments/notification', $payload)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->postJson('/api/payments/notification', $payload)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'transaction_id' => 'midtrans-renewal-transaction',
            'payment_type' => 'bank_transfer',
            'transaction_status' => 'settlement',
        ]);
        $this->assertNotNull($payment->fresh()->paid_at);
        $this->assertNotNull($payment->fresh()->settlement_time);

        $this->assertSame('2026-12-11', $occupancy->fresh()?->end_date?->toDateString());
        $this->assertSame('active', $occupancy->fresh()?->status);
        $this->assertDatabaseCount('room_occupancies', 1);
        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'payment_status' => 'paid',
        ]);
        $this->assertDatabaseHas('rooms', [
            'id' => $room->id,
            'is_available' => false,
            'room_status' => 'occupied',
        ]);
    }

    public function test_tenant_can_download_initial_payment_receipt_pdf(): void
    {
        $tenant = User::factory()->create([
            'role' => 'tenant',
            'name' => 'Tenant Receipt',
            'email' => 'tenant-receipt@koshandayani.test',
        ]);
        $room = $this->createRoom(500000);
        $application = $this->createPaidApplication($tenant, $room, '3 Bulan');
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'KH-RECEIPT-INITIAL',
            'transaction_id' => 'TX-INITIAL-1',
            'subtotal_amount' => 1500000,
            'discount_amount' => 100000,
            'duration_months' => 3,
            'monthly_price' => 500000,
            'period_start' => '2026-06-10',
            'period_end' => '2026-09-10',
            'gross_amount' => 1400000,
            'payment_type' => 'bank_transfer',
            'transaction_status' => 'settlement',
            'paid_at' => now(),
            'settlement_time' => now(),
        ]);

        $response = $this
            ->actingAs($tenant)
            ->get('/api/payments/'.$payment->id.'/receipt');

        $response
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->assertStringStartsWith('%PDF-', $response->getContent());
        $this->assertStringContainsString('filename=', (string) $response->headers->get('content-disposition'));
    }

    public function test_tenant_can_download_renewal_payment_receipt_pdf(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createOccupiedRoom(500000);
        $application = $this->createPaidApplication($tenant, $room);
        $occupancy = $this->createActiveOccupancy($tenant, $room, $application);
        $payment = Payment::create([
            'rental_application_id' => $application->id,
            'room_occupancy_id' => $occupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'KH-RECEIPT-RENEWAL',
            'transaction_id' => 'TX-RENEWAL-1',
            'subtotal_amount' => 1500000,
            'discount_amount' => 100000,
            'duration_months' => 3,
            'monthly_price' => 500000,
            'period_start' => '2026-09-11',
            'period_end' => '2026-12-11',
            'gross_amount' => 1400000,
            'payment_type' => 'bank_transfer',
            'transaction_status' => 'capture',
            'paid_at' => now(),
            'settlement_time' => now(),
        ]);

        $response = $this
            ->actingAs($tenant)
            ->get('/api/payments/'.$payment->id.'/receipt');

        $response
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->assertStringStartsWith('%PDF-', $response->getContent());
    }

    public function test_receipt_download_requires_successful_owned_tenant_payment(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $otherTenant = User::factory()->create(['role' => 'tenant']);
        $owner = User::factory()->create(['role' => 'owner']);
        $pendingApplication = $this->createApprovedApplication($tenant, $this->createRoom(500000));
        $pendingPayment = Payment::create([
            'rental_application_id' => $pendingApplication->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'KH-RECEIPT-PENDING',
            'gross_amount' => 500000,
            'transaction_status' => 'pending',
            'snap_token' => 'pending-token',
        ]);
        $otherApplication = $this->createPaidApplication($otherTenant, $this->createRoom(500000));
        $otherPayment = Payment::create([
            'rental_application_id' => $otherApplication->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'KH-RECEIPT-OTHER',
            'gross_amount' => 500000,
            'transaction_status' => 'settlement',
            'paid_at' => now(),
        ]);

        $this
            ->actingAs($tenant)
            ->getJson('/api/payments/'.$pendingPayment->id.'/receipt')
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Bukti pembayaran tersedia setelah pembayaran berhasil.');

        $this
            ->actingAs($tenant)
            ->getJson('/api/payments/'.$otherPayment->id.'/receipt')
            ->assertNotFound();

        $this
            ->actingAs($owner)
            ->getJson('/api/payments/'.$otherPayment->id.'/receipt')
            ->assertForbidden();
    }

    public static function durationDiscountCases(): array
    {
        return [
            '1 month' => ['1 Bulan', 1, 500000, 0, 500000],
            '3 months' => ['3 Bulan', 3, 1500000, 100000, 1400000],
            '6 months' => ['6 Bulan', 6, 3000000, 200000, 2800000],
            '12 months' => ['12 Bulan', 12, 6000000, 300000, 5700000],
        ];
    }

    private function createRoom(int $price = 1500000): Room
    {
        return Room::create([
            'room_name' => 'Kamar Payment',
            'branch' => 'Cabang Utama',
            'gender_type' => 'mixed',
            'room_status' => 'available',
            'price' => $price,
            'max_guest' => 1,
            'is_available' => true,
        ]);
    }

    private function createOccupiedRoom(int $price = 1500000): Room
    {
        $room = $this->createRoom($price);
        $room->update([
            'is_available' => false,
            'room_status' => 'occupied',
        ]);

        return $room->fresh();
    }

    private function createApprovedApplication(User $tenant, Room $room, string $duration = '3 Bulan'): RentalApplication
    {
        return RentalApplication::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'move_in_date' => '2026-06-10',
            'duration' => $duration,
            'status' => 'approved',
            'payment_status' => 'unpaid',
            'approved_at' => now(),
        ]);
    }

    private function createPaidApplication(User $tenant, Room $room, string $duration = '3 Bulan'): RentalApplication
    {
        $application = $this->createApprovedApplication($tenant, $room, $duration);
        $application->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        return $application->fresh();
    }

    private function createActiveOccupancy(User $tenant, Room $room, RentalApplication $application): RoomOccupancy
    {
        return RoomOccupancy::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'rental_application_id' => $application->id,
            'start_date' => '2026-06-10',
            'end_date' => '2026-09-10',
            'status' => 'active',
        ]);
    }

    private function payloadItemTotal(array $items): int
    {
        return array_reduce(
            $items,
            fn (int $total, array $item): int => $total + ((int) $item['price'] * (int) $item['quantity']),
            0,
        );
    }
}
