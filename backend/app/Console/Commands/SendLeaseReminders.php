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

        RoomOccupancy::with(['user', 'room.branch', 'rentalApplication'])
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
        $locale = 'id';
        $isOverdue = str_starts_with($reminderType, 'OVERDUE');
        $endDate = $occupancy->end_date?->copy()->locale($locale);
        $daysDiff = $endDate ? (int) $today->diffInDays($endDate->copy()->startOfDay(), false) : 0;
        $daysLeft = max(0, $daysDiff);
        $overdueDays = $isOverdue ? abs($daysDiff) : null;
        $tenantName = $user?->name ?? 'Penyewa';
        $roomName = $occupancy->room?->room_name ?? 'Kamar';
        $branchName = $occupancy->room?->branch?->branch_name
            ?? $occupancy->room?->branch
            ?? 'Cabang KosHandayani';
        $formattedEndDate = $endDate?->translatedFormat('d F Y') ?? '-';
        $subject = $this->resolveReminderSubject($reminderType);
        $reminderMessage = $this->resolveReminderMessage($reminderType, $daysLeft, $overdueDays);
        $actionUrl = $this->leaseActionUrl($occupancy);
        $body = $this->buildPlainTextBody(
            tenantName: $tenantName,
            roomName: $roomName,
            branchName: $branchName,
            endDate: $formattedEndDate,
            reminderMessage: $reminderMessage,
            actionUrl: $actionUrl,
            daysLeft: $daysLeft,
            overdueDays: $overdueDays,
        );

        Mail::to($user->email)->send(new LeaseReminderMail($subject, $body, [
            'title' => $subject,
            'preheader' => $reminderMessage,
            'eyebrow' => $isOverdue ? 'Masa Sewa Berakhir' : 'Pengingat Sewa',
            'tenantName' => $tenantName,
            'roomName' => $roomName,
            'branchName' => $branchName,
            'endDate' => $formattedEndDate,
            'daysLeft' => $isOverdue ? null : $daysLeft,
            'overdueDays' => $overdueDays,
            'actionUrl' => $actionUrl,
            'reminderMessage' => $reminderMessage,
            'tone' => $isOverdue ? 'overdue' : 'upcoming',
        ]));

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

    private function resolveReminderSubject(string $reminderType): string
    {
        if ($reminderType === 'H-0') {
            return 'Masa Sewa Anda Berakhir Hari Ini';
        }

        if (str_starts_with($reminderType, 'OVERDUE')) {
            return 'Masa Sewa Telah Berakhir';
        }

        return 'Pengingat Masa Sewa Akan Berakhir';
    }

    private function resolveReminderMessage(string $reminderType, int $daysLeft, ?int $overdueDays): string
    {
        if ($reminderType === 'H-0') {
            return 'masa sewa Anda berakhir hari ini. Silakan lakukan perpanjangan jika ingin tetap menempati kamar.';
        }

        if ($overdueDays !== null) {
            return 'masa sewa Anda telah berakhir. Silakan lakukan perpanjangan atau hubungi pengelola.';
        }

        return "masa sewa Anda akan berakhir dalam {$daysLeft} hari.";
    }

    private function leaseActionUrl(RoomOccupancy $occupancy): string
    {
        return rtrim(config('app.frontend_url'), '/').'/tenant/perpanjang-sewa';
    }

    private function buildPlainTextBody(
        string $tenantName,
        string $roomName,
        string $branchName,
        string $endDate,
        string $reminderMessage,
        string $actionUrl,
        int $daysLeft,
        ?int $overdueDays,
    ): string {
        $lines = [
            "Halo {$tenantName},",
            '',
            ucfirst($reminderMessage),
            '',
            "Nama kamar: {$roomName}",
            "Cabang: {$branchName}",
            "Tanggal berakhir: {$endDate}",
        ];

        if ($overdueDays !== null) {
            $lines[] = "Keterlambatan: {$overdueDays} hari";
        } else {
            $lines[] = "Sisa waktu: {$daysLeft} hari";
        }

        $lines[] = '';
        $lines[] = "Perpanjang sewa: {$actionUrl}";
        $lines[] = '';
        $lines[] = 'KosHandayani';

        return implode("\n", $lines);
    }
}
