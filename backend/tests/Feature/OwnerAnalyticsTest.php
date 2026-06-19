<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\LeaseReminder;
use App\Models\Payment;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\RoomOccupancy;
use App\Models\User;
use App\Services\OwnerAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class OwnerAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Branch $branch;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-06-19 09:00:00');
        $this->owner = User::factory()->create(['role' => 'owner']);
        Branch::query()->delete();
        $this->branch = Branch::create([
            'branch_name' => 'Cabang Analytics',
            'city' => 'Bandung',
            'address' => 'Jl. Analytics',
        ]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_owner_dashboard_uses_occupancy_and_payment_categories_as_source_of_truth(): void
    {
        [$tenant, $room, $application, $occupancy] = $this->createActiveLease('2026-06-26');
        $this->createRoom('Kamar Kosong', 'available');
        $this->createRoom('Kamar Maintenance', 'maintenance');

        Payment::create([
            'rental_application_id' => $application->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'INITIAL-ANALYTICS',
            'gross_amount' => 1000000,
            'transaction_status' => 'settlement',
            'paid_at' => '2026-06-10 10:00:00',
        ]);
        Payment::create([
            'rental_application_id' => $application->id,
            'room_occupancy_id' => $occupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'RENEWAL-ANALYTICS',
            'gross_amount' => 500000,
            'transaction_status' => 'settlement',
            'paid_at' => '2026-06-15 10:00:00',
        ]);
        Payment::create([
            'rental_application_id' => $application->id,
            'room_occupancy_id' => $occupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'RENEWAL-PENDING',
            'gross_amount' => 500000,
            'transaction_status' => 'pending',
        ]);
        LeaseReminder::create([
            'room_occupancy_id' => $occupancy->id,
            'user_id' => $tenant->id,
            'channel' => 'email',
            'reminder_type' => 'H-7',
            'sent_at' => now(),
        ]);

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/dashboard')
            ->assertOk()
            ->assertJsonPath('data.units.total', 3)
            ->assertJsonPath('data.units.occupied', 1)
            ->assertJsonPath('data.units.vacant', 1)
            ->assertJsonPath('data.units.maintenance', 1)
            ->assertJsonPath('data.revenue.this_month', 1500000)
            ->assertJsonPath('data.revenue.initial', 1000000)
            ->assertJsonPath('data.revenue.renewal', 500000)
            ->assertJsonPath('data.tenants.active', 1)
            ->assertJsonPath('data.tenants.h7', 1)
            ->assertJsonPath('data.renewals.pending', 1)
            ->assertJsonPath('data.renewals.successful', 1)
            ->assertJsonPath('data.branches.0.branch_name', 'Cabang Analytics')
            ->assertJsonPath('data.branches.0.active_tenants', 1);
    }

    public function test_owner_room_tenant_payment_and_report_endpoints_return_lifecycle_data(): void
    {
        [$tenant, $room, $application, $occupancy] = $this->createActiveLease('2026-06-18');
        Payment::create([
            'rental_application_id' => $application->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'INITIAL-REPORT',
            'gross_amount' => 1200000,
            'transaction_status' => 'capture',
            'paid_at' => '2026-06-05 10:00:00',
        ]);
        Payment::create([
            'rental_application_id' => $application->id,
            'room_occupancy_id' => $occupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'RENEWAL-FAILED',
            'gross_amount' => 600000,
            'transaction_status' => 'expire',
        ]);

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/rooms-overview')
            ->assertOk()
            ->assertJsonPath('data.0.occupancy.tenant.full_name', $tenant->name)
            ->assertJsonPath('data.0.occupancy.lifecycle_status', 'overdue')
            ->assertJsonPath('data.0.occupancy.renewal_status.key', 'failed');

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/tenants')
            ->assertOk()
            ->assertJsonPath('data.0.room.room_name', $room->room_name)
            ->assertJsonPath('data.0.lifecycle_label', 'Overdue')
            ->assertJsonPath('data.0.renewal_status.key', 'failed')
            ->assertJsonCount(2, 'data.0.payments');

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/payments')
            ->assertOk()
            ->assertJsonPath('data.stats.revenue_initial', 1200000)
            ->assertJsonPath('data.stats.revenue_renewal', 0)
            ->assertJsonPath('data.stats.failed_amount', 600000);

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/reports?year=2026&month=6&branch_id='.$this->branch->id)
            ->assertOk()
            ->assertJsonPath('data.summary.total_revenue', 1200000)
            ->assertJsonPath('data.summary.initial_revenue', 1200000)
            ->assertJsonPath('data.summary.renewal_revenue', 0)
            ->assertJsonPath('data.summary.active_tenants', 1)
            ->assertJsonPath('data.revenue_per_branch.0.branch_name', 'Cabang Analytics');
    }

    public function test_all_owner_analytics_endpoints_honor_all_and_individual_branch_scopes(): void
    {
        $secondBranch = Branch::create([
            'branch_name' => 'Cabang Dua',
            'city' => 'Jakarta',
            'address' => 'Jl. Cabang Dua',
        ]);

        [$firstTenant, , $firstApplication, $firstOccupancy] = $this->createActiveLease(
            '2026-06-26',
            $this->branch,
            'Tenant Cabang Satu',
            'Kamar Satu Terisi',
        );
        $firstVacantRoom = $this->createRoom('Kamar Satu Kosong', 'available', $this->branch);
        RentalApplication::create([
            'user_id' => User::factory()->create(['role' => 'tenant'])->id,
            'room_id' => $firstVacantRoom->id,
            'move_in_date' => '2026-07-01',
            'duration' => '1 Bulan',
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);
        Payment::create([
            'rental_application_id' => $firstApplication->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'BRANCH-ONE-INITIAL',
            'gross_amount' => 1000000,
            'transaction_status' => 'settlement',
            'paid_at' => '2026-06-10 10:00:00',
        ]);
        Payment::create([
            'rental_application_id' => $firstApplication->id,
            'room_occupancy_id' => $firstOccupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'BRANCH-ONE-RENEWAL',
            'gross_amount' => 500000,
            'transaction_status' => 'capture',
            'paid_at' => '2026-06-15 10:00:00',
        ]);
        LeaseReminder::create([
            'room_occupancy_id' => $firstOccupancy->id,
            'user_id' => $firstTenant->id,
            'channel' => 'email',
            'reminder_type' => 'H-7',
            'sent_at' => now(),
        ]);

        [$secondTenant, , $secondApplication, $secondOccupancy] = $this->createActiveLease(
            '2026-07-25',
            $secondBranch,
            'Tenant Cabang Dua',
            'Kamar Dua Terisi',
        );
        Payment::create([
            'rental_application_id' => $secondApplication->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'BRANCH-TWO-INITIAL',
            'gross_amount' => 2000000,
            'transaction_status' => 'settlement',
            'paid_at' => '2026-06-12 10:00:00',
        ]);
        Payment::create([
            'rental_application_id' => $secondApplication->id,
            'room_occupancy_id' => $secondOccupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'BRANCH-TWO-RENEWAL-PENDING',
            'gross_amount' => 700000,
            'transaction_status' => 'pending',
        ]);
        Payment::create([
            'rental_application_id' => $secondApplication->id,
            'room_occupancy_id' => $secondOccupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'BRANCH-TWO-RENEWAL-FAILED',
            'gross_amount' => 300000,
            'transaction_status' => 'expire',
        ]);
        LeaseReminder::create([
            'room_occupancy_id' => $secondOccupancy->id,
            'user_id' => $secondTenant->id,
            'channel' => 'email',
            'reminder_type' => 'H-30',
            'sent_at' => now(),
        ]);

        $allDashboard = $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/dashboard?branch_id=all')
            ->assertOk()
            ->assertJsonPath('data.units.total', 3)
            ->assertJsonPath('data.units.occupied', 2)
            ->assertJsonPath('data.revenue.total', 3500000)
            ->assertJsonPath('data.revenue.initial', 3000000)
            ->assertJsonPath('data.revenue.renewal', 500000)
            ->assertJsonPath('data.tenants.active', 2)
            ->assertJsonPath('data.renewals.pending', 1)
            ->assertJsonPath('data.renewals.successful', 1)
            ->assertJsonCount(2, 'data.branches');

        $firstDashboard = $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/dashboard?branch_id='.$this->branch->id)
            ->assertOk()
            ->assertJsonPath('data.units.total', 2)
            ->assertJsonPath('data.units.occupied', 1)
            ->assertJsonPath('data.units.vacant', 1)
            ->assertJsonPath('data.revenue.total', 1500000)
            ->assertJsonPath('data.revenue.renewal', 500000)
            ->assertJsonPath('data.tenants.active', 1)
            ->assertJsonPath('data.renewals.pending', 0)
            ->assertJsonPath('data.renewals.successful', 1)
            ->assertJsonCount(1, 'data.branches')
            ->assertJsonPath('data.branches.0.id', $this->branch->id);

        $secondDashboard = $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/dashboard?branch_id='.$secondBranch->id)
            ->assertOk()
            ->assertJsonPath('data.units.total', 1)
            ->assertJsonPath('data.units.occupied', 1)
            ->assertJsonPath('data.revenue.total', 2000000)
            ->assertJsonPath('data.revenue.renewal', 0)
            ->assertJsonPath('data.tenants.active', 1)
            ->assertJsonPath('data.renewals.pending', 1)
            ->assertJsonPath('data.renewals.failed', 1)
            ->assertJsonCount(1, 'data.branches')
            ->assertJsonPath('data.branches.0.id', $secondBranch->id);

        $allActivityDescriptions = collect($allDashboard->json('data.activities'))->pluck('description');
        $this->assertTrue($allActivityDescriptions->contains(fn (string $description) => str_contains($description, 'Tenant Cabang Satu')));
        $this->assertTrue($allActivityDescriptions->contains(fn (string $description) => str_contains($description, 'Tenant Cabang Dua')));
        $firstActivityDescriptions = collect($firstDashboard->json('data.activities'))->pluck('description')->join(' ');
        $secondActivityDescriptions = collect($secondDashboard->json('data.activities'))->pluck('description')->join(' ');
        $this->assertStringContainsString('Tenant Cabang Satu', $firstActivityDescriptions);
        $this->assertStringNotContainsString('Tenant Cabang Dua', $firstActivityDescriptions);
        $this->assertStringContainsString('Tenant Cabang Dua', $secondActivityDescriptions);
        $this->assertStringNotContainsString('Tenant Cabang Satu', $secondActivityDescriptions);

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/rooms-overview?branch_id='.$secondBranch->id)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.branch.id', $secondBranch->id);

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/application-monitoring?branch_id='.$this->branch->id)
            ->assertOk()
            ->assertJsonPath('data.stats.pending_review', 1)
            ->assertJsonPath('data.stats.payment_success', 1)
            ->assertJsonPath('data.stats.renewal_pending', 0)
            ->assertJsonCount(2, 'data.all_applications');

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/application-monitoring?branch_id='.$secondBranch->id)
            ->assertOk()
            ->assertJsonPath('data.stats.pending_review', 0)
            ->assertJsonPath('data.stats.payment_success', 1)
            ->assertJsonPath('data.stats.renewal_pending', 1)
            ->assertJsonCount(1, 'data.all_applications');

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/tenants?branch_id='.$this->branch->id)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.tenant.full_name', 'Tenant Cabang Satu')
            ->assertJsonPath('data.0.latest_reminder.reminder_type', 'H-7');

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/payments?branch_id='.$secondBranch->id)
            ->assertOk()
            ->assertJsonPath('data.stats.total_collected', 2000000)
            ->assertJsonPath('data.stats.revenue_initial', 2000000)
            ->assertJsonPath('data.stats.revenue_renewal', 0)
            ->assertJsonPath('data.stats.pending_amount', 700000)
            ->assertJsonPath('data.stats.failed_amount', 300000)
            ->assertJsonCount(3, 'data.payments');

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/reports?year=2026&month=6&branch_id=all')
            ->assertOk()
            ->assertJsonPath('data.summary.total_revenue', 3500000)
            ->assertJsonPath('data.summary.occupancy_rate', 66.7)
            ->assertJsonPath('data.summary.active_tenants', 2)
            ->assertJsonCount(2, 'data.revenue_per_branch');

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/reports?year=2026&month=6&branch_id='.$this->branch->id)
            ->assertOk()
            ->assertJsonPath('data.summary.total_revenue', 1500000)
            ->assertJsonPath('data.summary.renewal_revenue', 500000)
            ->assertJsonPath('data.summary.occupancy_rate', 50)
            ->assertJsonCount(1, 'data.revenue_per_branch');

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/reports?year=2026&month=6&branch_id='.$secondBranch->id)
            ->assertOk()
            ->assertJsonPath('data.summary.total_revenue', 2000000)
            ->assertJsonPath('data.summary.renewal_revenue', 0)
            ->assertJsonPath('data.summary.occupancy_rate', 100)
            ->assertJsonCount(1, 'data.revenue_per_branch');

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/dashboard?branch_id=999999')
            ->assertUnprocessable();
    }

    public function test_owner_report_pdf_uses_the_same_analytics_filters_for_all_and_each_branch(): void
    {
        $secondBranch = Branch::create([
            'branch_name' => 'Cabang PDF Dua',
            'city' => 'Jakarta',
            'address' => 'Jl. PDF Dua',
        ]);

        [, , $firstApplication, $firstOccupancy] = $this->createActiveLease(
            '2026-07-20',
            $this->branch,
            'Tenant PDF Satu',
            'Kamar PDF Satu',
        );
        $this->createRoom('Kamar PDF Kosong', 'available', $this->branch);
        [, , $secondApplication, $secondOccupancy] = $this->createActiveLease(
            '2026-07-20',
            $secondBranch,
            'Tenant PDF Dua',
            'Kamar PDF Dua',
        );

        Payment::create([
            'rental_application_id' => $firstApplication->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'PDF-BRANCH-ONE-INITIAL',
            'gross_amount' => 1000000,
            'transaction_status' => 'settlement',
            'paid_at' => '2026-06-05 10:00:00',
        ]);
        Payment::create([
            'rental_application_id' => $firstApplication->id,
            'room_occupancy_id' => $firstOccupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'PDF-BRANCH-ONE-PENDING',
            'gross_amount' => 300000,
            'transaction_status' => 'pending',
            'created_at' => '2026-06-07 10:00:00',
            'updated_at' => '2026-06-07 10:00:00',
        ]);
        Payment::create([
            'rental_application_id' => $secondApplication->id,
            'room_occupancy_id' => $secondOccupancy->id,
            'payment_category' => Payment::CATEGORY_RENEWAL,
            'order_id' => 'PDF-BRANCH-TWO-RENEWAL',
            'gross_amount' => 500000,
            'transaction_status' => 'capture',
            'paid_at' => '2026-06-10 10:00:00',
        ]);
        Payment::create([
            'rental_application_id' => $secondApplication->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'PDF-BRANCH-TWO-JULY',
            'gross_amount' => 2000000,
            'transaction_status' => 'settlement',
            'paid_at' => '2026-07-03 10:00:00',
        ]);

        $analytics = app(OwnerAnalyticsService::class);
        $allJune = $analytics->reports(2026, 6);
        $firstJune = $analytics->reports(2026, 6, $this->branch->id);
        $secondJune = $analytics->reports(2026, 6, $secondBranch->id);
        $secondJuly = $analytics->reports(2026, 7, $secondBranch->id);

        $this->assertSame($allJune['summary']['total_revenue'], $allJune['export']['financial_summary']['total_income']);
        $this->assertSame(1500000, $allJune['export']['financial_summary']['total_income']);
        $this->assertSame(0, $allJune['export']['financial_summary']['total_expenses']);
        $this->assertSame(1500000, $allJune['export']['financial_summary']['net_balance']);
        $this->assertSame(3, $allJune['export']['property_summary']['total_rooms']);
        $this->assertSame(2, $allJune['export']['property_summary']['occupied_rooms']);
        $this->assertSame(1, $allJune['export']['property_summary']['vacant_rooms']);
        $this->assertSame(1, $allJune['export']['payment_summary']['initial_count']);
        $this->assertSame(2, $allJune['export']['payment_summary']['renewal_count']);
        $this->assertSame(2, $allJune['export']['payment_summary']['successful_count']);
        $this->assertSame(1, $allJune['export']['payment_summary']['pending_count']);
        $this->assertCount(3, $allJune['export']['transactions']);

        $this->assertSame(1000000, $firstJune['export']['financial_summary']['total_income']);
        $this->assertSame('Cabang Analytics', $firstJune['export']['meta']['branch_label']);
        $this->assertCount(2, $firstJune['export']['transactions']);
        $this->assertSame(
            ['Cabang Analytics'],
            collect($firstJune['export']['transactions'])->pluck('branch_name')->unique()->values()->all(),
        );

        $this->assertSame(500000, $secondJune['export']['financial_summary']['total_income']);
        $this->assertCount(1, $secondJune['export']['transactions']);
        $this->assertSame('Perpanjangan', $secondJune['export']['transactions'][0]['payment_type']);
        $this->assertSame('Lunas', $secondJune['export']['transactions'][0]['status']);

        $this->assertSame(2000000, $secondJuly['export']['financial_summary']['total_income']);
        $this->assertCount(1, $secondJuly['export']['transactions']);
        $this->assertSame('Pembayaran Awal', $secondJuly['export']['transactions'][0]['payment_type']);

        foreach ([
            '/api/owner/reports/export-pdf?year=2026&month=6&branch_id=all',
            '/api/owner/reports/export-pdf?year=2026&month=6&branch_id='.$this->branch->id,
            '/api/owner/reports/export-pdf?year=2026&month=6&branch_id='.$secondBranch->id,
        ] as $endpoint) {
            $response = $this->actingAs($this->owner)->get($endpoint);

            $response
                ->assertOk()
                ->assertHeader('content-type', 'application/pdf');
            $this->assertStringStartsWith('%PDF-', $response->getContent());
            $this->assertStringContainsString(
                'attachment; filename=laporan-keuangan-kos-handayani-2026-06-',
                (string) $response->headers->get('content-disposition'),
            );
        }
    }

    public function test_non_owner_cannot_access_owner_analytics(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);

        foreach ([
            '/api/owner/dashboard',
            '/api/owner/rooms-overview',
            '/api/owner/application-monitoring',
            '/api/owner/payments',
            '/api/owner/tenants',
            '/api/owner/reports',
            '/api/owner/reports/export-pdf',
        ] as $endpoint) {
            $this->actingAs($tenant)->getJson($endpoint)->assertForbidden();
        }
    }

    private function createActiveLease(
        string $endDate,
        ?Branch $branch = null,
        ?string $tenantName = null,
        string $roomName = 'Kamar Terisi',
    ): array {
        $tenant = User::factory()->create([
            'role' => 'tenant',
            ...($tenantName ? ['name' => $tenantName] : []),
        ]);
        $room = $this->createRoom($roomName, 'occupied', $branch);
        $application = RentalApplication::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'move_in_date' => '2026-05-19',
            'duration' => '1 Bulan',
            'status' => 'approved',
            'payment_status' => 'paid',
            'approved_at' => '2026-05-18 10:00:00',
            'paid_at' => '2026-05-19 10:00:00',
        ]);
        $occupancy = RoomOccupancy::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'rental_application_id' => $application->id,
            'start_date' => '2026-05-19',
            'end_date' => $endDate,
            'status' => 'active',
        ]);

        return [$tenant, $room, $application, $occupancy];
    }

    private function createRoom(string $name, string $status, ?Branch $branch = null): Room
    {
        $branch ??= $this->branch;

        return Room::create([
            'room_name' => $name,
            'branch_id' => $branch->id,
            'branch' => $branch->branch_name,
            'gender_type' => 'mixed',
            'room_status' => $status,
            'price' => 1000000,
            'max_guest' => 1,
            'is_available' => $status === 'available',
        ]);
    }
}
