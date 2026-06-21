<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\User;
use App\Services\OwnerAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExpenseManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Branch $firstBranch;

    private Branch $secondBranch;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-06-21 10:00:00');
        $this->owner = User::factory()->create(['role' => 'owner']);
        Branch::query()->delete();
        $this->firstBranch = Branch::create([
            'branch_name' => 'Cabang Pengeluaran Satu',
            'city' => 'Bandung',
            'address' => 'Jl. Satu',
        ]);
        $this->secondBranch = Branch::create([
            'branch_name' => 'Cabang Pengeluaran Dua',
            'city' => 'Jakarta',
            'address' => 'Jl. Dua',
        ]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_owner_can_create_and_filter_expenses_with_optional_receipt(): void
    {
        Storage::fake('public');

        $response = $this
            ->actingAs($this->owner)
            ->post('/api/owner/expenses', [
                'branch_id' => $this->firstBranch->id,
                'category' => 'Utilitas',
                'description' => 'Tagihan listrik Juni',
                'amount' => 450000,
                'expense_date' => '2026-06-15',
                'receipt' => UploadedFile::fake()->create('listrik.pdf', 100, 'application/pdf'),
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.branch.id', $this->firstBranch->id)
            ->assertJsonPath('data.category', 'Utilitas')
            ->assertJsonPath('data.amount', 450000)
            ->assertJsonPath('data.creator.id', $this->owner->id);

        $expense = Expense::firstOrFail();
        Storage::disk('public')->assertExists($expense->receipt_path);

        Expense::create([
            'branch_id' => $this->secondBranch->id,
            'category' => 'Internet',
            'description' => 'Internet cabang dua',
            'amount' => 300000,
            'expense_date' => '2026-06-18',
            'created_by' => $this->owner->id,
        ]);
        Expense::create([
            'branch_id' => $this->firstBranch->id,
            'category' => 'Perawatan',
            'description' => 'Perawatan bulan Mei',
            'amount' => 200000,
            'expense_date' => '2026-05-18',
            'created_by' => $this->owner->id,
        ]);

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/expenses?year=2026&month=6&branch_id='.$this->firstBranch->id.'&category=Utilitas')
            ->assertOk()
            ->assertJsonPath('data.stats.total_expense', 450000)
            ->assertJsonPath('data.stats.transaction_count', 1)
            ->assertJsonPath('data.stats.largest_category.category', 'Utilitas')
            ->assertJsonPath('data.stats.average_expense', 450000)
            ->assertJsonPath('data.expense_by_branch.0.id', $this->firstBranch->id)
            ->assertJsonPath('data.expense_by_branch.0.amount', 450000)
            ->assertJsonCount(1, 'data.expenses');
    }

    public function test_expense_validation_and_owner_authorization_are_enforced(): void
    {
        $this
            ->actingAs($this->owner)
            ->postJson('/api/owner/expenses', [
                'branch_id' => 999999,
                'category' => 'Kategori Tidak Valid',
                'amount' => 0,
                'expense_date' => '',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['branch_id', 'category', 'amount', 'expense_date']);

        $tenant = User::factory()->create(['role' => 'tenant']);

        $this->actingAs($tenant)->getJson('/api/owner/expenses')->assertForbidden();
        $this
            ->actingAs($tenant)
            ->postJson('/api/owner/expenses', [
                'branch_id' => $this->firstBranch->id,
                'category' => 'Utilitas',
                'amount' => 1000,
                'expense_date' => '2026-06-21',
            ])
            ->assertForbidden();
    }

    public function test_dashboard_reports_and_pdf_share_expense_and_branch_filters_without_changing_revenue(): void
    {
        $room = Room::create([
            'room_name' => 'Kamar Finansial',
            'branch_id' => $this->firstBranch->id,
            'branch' => $this->firstBranch->branch_name,
            'gender_type' => 'mixed',
            'room_status' => 'available',
            'price' => 1000000,
            'max_guest' => 1,
            'is_available' => true,
        ]);
        $tenant = User::factory()->create(['role' => 'tenant']);
        $application = RentalApplication::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'move_in_date' => '2026-06-01',
            'duration' => '1 Bulan',
            'status' => 'approved',
            'payment_status' => 'paid',
        ]);
        Payment::create([
            'rental_application_id' => $application->id,
            'payment_category' => Payment::CATEGORY_INITIAL_RENT,
            'order_id' => 'EXPENSE-REVENUE-CONTROL',
            'gross_amount' => 2000000,
            'transaction_status' => 'settlement',
            'paid_at' => '2026-06-10 10:00:00',
        ]);

        Expense::create([
            'branch_id' => $this->firstBranch->id,
            'category' => 'Perawatan',
            'description' => 'Perbaikan cabang satu',
            'amount' => 500000,
            'expense_date' => '2026-06-12',
            'created_by' => $this->owner->id,
        ]);
        Expense::create([
            'branch_id' => $this->secondBranch->id,
            'category' => 'Internet',
            'description' => 'Internet cabang dua',
            'amount' => 300000,
            'expense_date' => '2026-06-13',
            'created_by' => $this->owner->id,
        ]);
        Expense::create([
            'branch_id' => $this->firstBranch->id,
            'category' => 'Pajak',
            'description' => 'Pajak bulan Juli',
            'amount' => 250000,
            'expense_date' => '2026-07-01',
            'created_by' => $this->owner->id,
        ]);

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/dashboard?branch_id='.$this->firstBranch->id)
            ->assertOk()
            ->assertJsonPath('data.revenue.this_month', 2000000)
            ->assertJsonPath('data.financial.revenue', 2000000)
            ->assertJsonPath('data.financial.expense', 500000)
            ->assertJsonPath('data.financial.net_profit', 1500000)
            ->assertJsonPath('data.expense.largest_category.category', 'Perawatan')
            ->assertJsonPath('data.branches.0.expense', 750000);

        $this
            ->actingAs($this->owner)
            ->getJson('/api/owner/reports?year=2026&month=6&branch_id='.$this->firstBranch->id)
            ->assertOk()
            ->assertJsonPath('data.summary.total_revenue', 2000000)
            ->assertJsonPath('data.summary.total_expense', 500000)
            ->assertJsonPath('data.summary.net_profit', 1500000)
            ->assertJsonPath('data.expense_by_category.0.category', 'Perawatan')
            ->assertJsonPath('data.expense_by_branch.0.amount', 500000)
            ->assertJsonCount(1, 'data.recent_expenses');

        $analytics = app(OwnerAnalyticsService::class);
        $juneReport = $analytics->reports(2026, 6, $this->firstBranch->id);
        $julyReport = $analytics->reports(2026, 7, $this->firstBranch->id);

        $this->assertSame(2000000, $juneReport['export']['financial_summary']['total_income']);
        $this->assertSame(500000, $juneReport['export']['financial_summary']['total_expenses']);
        $this->assertSame(1500000, $juneReport['export']['financial_summary']['net_balance']);
        $this->assertSame('Perawatan', $juneReport['export']['expense_by_category'][0]['category']);
        $this->assertCount(1, $juneReport['export']['expenses']);
        $this->assertSame(250000, $julyReport['export']['financial_summary']['total_expenses']);
        $this->assertCount(1, $julyReport['export']['expenses']);

        $pdfResponse = $this
            ->actingAs($this->owner)
            ->get('/api/owner/reports/export-pdf?year=2026&month=6&branch_id='.$this->firstBranch->id);

        $pdfResponse
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $pdfResponse->getContent());
    }
}
