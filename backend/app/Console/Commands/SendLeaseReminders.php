<?php

namespace App\Console\Commands;

use App\Mail\LeaseReminderMail;
use App\Models\LeaseReminder;
use App\Models\RoomOccupancy;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class SendLeaseReminders extends Command
{
    protected $signature = 'lease:send-reminders';

    protected $description = 'Send email reminders for active room occupancy lease end dates.';

    public function handle(): int
    {
        if (! Schema::hasTable('lease_reminders')) {
            $this->warn('Table lease_reminders does not exist.');
            Log::warning('Lease reminder command skipped because lease_reminders table does not exist');

            return self::FAILURE;
        }

        $today = Carbon::today();
        $sentCount = 0;
        $skippedCount = 0;

        RoomOccupancy::with(['user', 'room', 'rentalApplication'])
            ->where('status', 'active')
            ->whereNotNull('end_date')
            ->orderBy('end_date')
            ->chunkById(100, function ($occupancies) use ($today, &$sentCount, &$skippedCount): void {
                foreach ($occupancies as $occupancy) {
                    $reminderType = $this->determineReminderType($occupancy, $today);

                    if (! $reminderType) {
                        $skippedCount++;
                        continue;
                    }

                    if ($this->alreadySent($occupancy->id, $reminderType)) {
                        $skippedCount++;
                        continue;
                    }

                    $this->sendReminder($occupancy, $reminderType, $today);
                    $sentCount++;
                }
            });

        $this->info("Lease reminders sent: {$sentCount}. Skipped: {$skippedCount}.");

        return self::SUCCESS;
    }

    private function determineReminderType(RoomOccupancy $occupancy, Carbon $today): ?string
    {
        if (! $occupancy->end_date) {
            return null;
        }

        $daysLeft = (int) $today->diffInDays($occupancy->end_date->copy()->startOfDay(), false);

        if ($daysLeft < 0) {
            return 'OVERDUE_D'.abs($daysLeft);
        }

        $durationMonths = $this->getDurationInMonths((string) $occupancy->rentalApplication?->duration);
        $allowedReminderDays = $durationMonths === 1
            ? [7, 1, 0]
            : [30, 7, 1, 0];

        if (! in_array($daysLeft, $allowedReminderDays, true)) {
            return null;
        }

        return 'H-'.$daysLeft;
    }

    private function alreadySent(int $roomOccupancyId, string $reminderType): bool
    {
        return LeaseReminder::query()
            ->where('room_occupancy_id', $roomOccupancyId)
            ->where('reminder_type', $reminderType)
            ->where('channel', 'email')
            ->exists();
    }

    private function sendReminder(RoomOccupancy $occupancy, string $reminderType, Carbon $today): void
    {
        $user = $occupancy->user;
        $locale = in_array(app()->getLocale(), ['id', 'en'], true) ? app()->getLocale() : 'id';
        $isOverdue = str_starts_with($reminderType, 'OVERDUE');
        $endDate = $occupancy->end_date?->copy()->locale($locale);
        $daysLeft = $endDate ? max(0, (int) $today->diffInDays($endDate->copy()->startOfDay(), false)) : 0;
        $subject = __($isOverdue ? 'lease.overdue_subject' : 'lease.upcoming_subject', [], $locale);
        $body = __($isOverdue ? 'lease.overdue_body' : 'lease.upcoming_body', [
            'name' => $user?->name ?? 'Tenant',
            'end_date' => $endDate?->translatedFormat('d F Y') ?? '-',
            'days_left' => $daysLeft,
        ], $locale);

        Mail::to($user->email)->send(new LeaseReminderMail($subject, $body));

        LeaseReminder::create([
            'room_occupancy_id' => $occupancy->id,
            'user_id' => $occupancy->user_id,
            'channel' => 'email',
            'reminder_type' => $reminderType,
            'sent_at' => now(),
        ]);

        Log::info('Lease reminder email sent', [
            'room_occupancy_id' => $occupancy->id,
            'user_id' => $occupancy->user_id,
            'email' => $user->email,
            'reminder_type' => $reminderType,
            'end_date' => optional($occupancy->end_date)->toDateString(),
        ]);
    }

    private function getDurationInMonths(string $duration): int
    {
        preg_match('/\d+/', $duration, $matches);

        return max(1, (int) ($matches[0] ?? 1));
    }
}
