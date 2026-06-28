<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\URL;

class EmailPreviewController extends Controller
{
    public function verification(): Response
    {
        $this->ensureLocal();

        return response()->view('emails.verification', [
            'userName' => 'Rizky Ramadhan',
            'verificationUrl' => URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                [
                    'id' => 1,
                    'hash' => sha1('preview@koshandayani.test'),
                ],
            ),
        ]);
    }

    public function reminder(): Response
    {
        $this->ensureLocal();

        return response()->view('emails.lease-reminder', [
            'title' => 'Pengingat Masa Sewa Akan Berakhir',
            'preheader' => 'Masa sewa Anda akan berakhir dalam 7 hari.',
            'eyebrow' => 'Pengingat Sewa',
            'tenantName' => 'Rizky Ramadhan',
            'roomName' => 'Kamar B1',
            'branchName' => 'Cabang Utama',
            'endDate' => '23 Juni 2026',
            'daysLeft' => 7,
            'overdueDays' => null,
            'actionUrl' => rtrim(config('app.frontend_url'), '/').'/tenant/rental-applications',
            'reminderMessage' => 'masa sewa Anda akan berakhir dalam 7 hari.',
            'tone' => 'upcoming',
        ]);
    }

    public function passwordReset(): Response
    {
        $this->ensureLocal();

        return response()->view('emails.password-reset', [
            'userName' => 'Rizky Ramadhan',
            'resetUrl' => rtrim(config('app.frontend_url'), '/').'/reset-password?token=preview-token&email=preview%40koshandayani.test',
        ]);
    }

    public function overdue(): Response
    {
        $this->ensureLocal();

        return response()->view('emails.lease-reminder', [
            'title' => 'Masa Sewa Telah Berakhir',
            'preheader' => 'Masa sewa Anda telah berakhir.',
            'eyebrow' => 'Masa Sewa Berakhir',
            'tenantName' => 'Rizky Ramadhan',
            'roomName' => 'Kamar B1',
            'branchName' => 'Cabang Utama',
            'endDate' => '14 Juni 2026',
            'daysLeft' => null,
            'overdueDays' => 2,
            'actionUrl' => rtrim(config('app.frontend_url'), '/').'/tenant/rental-applications',
            'reminderMessage' => 'masa sewa Anda telah berakhir. Silakan lakukan perpanjangan atau hubungi pengelola.',
            'tone' => 'overdue',
        ]);
    }

    private function ensureLocal(): void
    {
        abort_unless(app()->environment('local'), 404);
    }
}
