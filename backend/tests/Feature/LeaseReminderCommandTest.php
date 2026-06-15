<?php

namespace Tests\Feature;

use App\Mail\LeaseReminderMail;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\RoomOccupancy;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class LeaseReminderCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (! Schema::hasTable('lease_reminders')) {
            Schema::create('lease_reminders', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('room_occupancy_id');
                $table->unsignedBigInteger('user_id');
                $table->string('channel');
                $table->string('reminder_type');
                $table->timestamp('sent_at')->nullable();
                $table->timestamps();
            });
        }

        Carbon::setTestNow('2026-06-01 08:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    #[DataProvider('upcomingReminderCases')]
    public function test_lease_reminder_command_sends_upcoming_reminders(int $daysLeft, string $duration, string $reminderType): void
    {
        Mail::fake();
        $occupancy = $this->createOccupancy($daysLeft, $duration);

        $this->artisan('lease:send-reminders')->assertExitCode(0);

        Mail::assertSent(LeaseReminderMail::class, function (LeaseReminderMail $mail) use ($occupancy): bool {
            return $mail->hasTo($occupancy->user->email)
                && $mail->subjectLine === 'Pengingat Masa Sewa Kos Handayani'
                && str_contains($mail->body, $occupancy->user->name);
        });

        $this->assertDatabaseHas('lease_reminders', [
            'room_occupancy_id' => $occupancy->id,
            'user_id' => $occupancy->user_id,
            'channel' => 'email',
            'reminder_type' => $reminderType,
        ]);
    }

    public function test_lease_reminder_command_sends_overdue_reminder(): void
    {
        Mail::fake();
        $occupancy = $this->createOccupancy(-1, '3 Bulan');

        $this->artisan('lease:send-reminders')->assertExitCode(0);

        Mail::assertSent(LeaseReminderMail::class, function (LeaseReminderMail $mail) use ($occupancy): bool {
            return $mail->hasTo($occupancy->user->email)
                && $mail->subjectLine === 'Masa Sewa Telah Berakhir';
        });

        $this->assertDatabaseHas('lease_reminders', [
            'room_occupancy_id' => $occupancy->id,
            'channel' => 'email',
            'reminder_type' => 'OVERDUE_D1',
        ]);
    }

    public function test_lease_reminder_is_not_sent_twice_for_same_type(): void
    {
        Mail::fake();
        $occupancy = $this->createOccupancy(7, '1 Bulan');

        $this->artisan('lease:send-reminders')->assertExitCode(0);
        $this->artisan('lease:send-reminders')->assertExitCode(0);

        Mail::assertSent(LeaseReminderMail::class, 1);
        $this->assertDatabaseCount('lease_reminders', 1);
        $this->assertDatabaseHas('lease_reminders', [
            'room_occupancy_id' => $occupancy->id,
            'channel' => 'email',
            'reminder_type' => 'H-7',
        ]);
    }

    public static function upcomingReminderCases(): array
    {
        return [
            'H30 reminder' => [30, '3 Bulan', 'H-30'],
            'H7 reminder' => [7, '1 Bulan', 'H-7'],
            'H1 reminder' => [1, '6 Bulan', 'H-1'],
            'H0 reminder' => [0, '12 Bulan', 'H-0'],
        ];
    }

    private function createOccupancy(int $daysLeft, string $duration): RoomOccupancy
    {
        $tenant = User::factory()->create([
            'role' => 'tenant',
            'name' => 'Tenant Reminder',
            'email' => 'tenant-reminder-'.abs($daysLeft).'-'.str_replace(' ', '-', $duration).'@example.com',
        ]);
        $room = Room::create([
            'room_name' => 'Kamar Reminder',
            'branch' => 'Cabang Utama',
            'room_type' => 'single',
            'gender_type' => 'mixed',
            'room_status' => 'occupied',
            'price' => 500000,
            'max_guest' => 1,
            'is_available' => false,
        ]);
        $application = RentalApplication::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'move_in_date' => '2026-03-01',
            'duration' => $duration,
            'status' => 'approved',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        return RoomOccupancy::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'rental_application_id' => $application->id,
            'start_date' => '2026-03-01',
            'end_date' => Carbon::today()->addDays($daysLeft)->toDateString(),
            'status' => 'active',
        ]);
    }
}
