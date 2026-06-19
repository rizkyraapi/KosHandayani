<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Throwable;

class EmailVerificationNotificationService
{
    /**
     * @return array{success: bool, user_id: int, email: string, notification_class: class-string, verification_url: string}
     */
    public function send(User $user, string $source): array
    {
        $verificationUrl = $this->verificationUrl($user);
        $notification = new VerifyEmailNotification($verificationUrl);
        $notificationClass = $notification::class;
        $mailRecipient = $user->routeNotificationFor('mail', $notification);

        Log::info('Email verification send requested', [
            'source' => $source,
            'user_id' => $user->id,
            'email' => $user->email,
            'mail_recipient' => $mailRecipient,
            'notification_class' => $notificationClass,
            'mail_mailer' => config('mail.default'),
            'mail_host' => config('mail.mailers.'.config('mail.default').'.host'),
            'mail_port' => config('mail.mailers.'.config('mail.default').'.port'),
            'mail_from_address' => config('mail.from.address'),
            'mail_from_name' => config('mail.from.name'),
            'queue_connection' => config('queue.default'),
            'app_url' => config('app.url'),
            'frontend_url' => config('app.frontend_url'),
            'verification_url_host' => parse_url($verificationUrl, PHP_URL_HOST),
        ]);

        try {
            Notification::sendNow($user, $notification);

            Log::info('Email verification email sent', [
                'source' => $source,
                'user_id' => $user->id,
                'email' => $user->email,
                'mail_recipient' => $mailRecipient,
                'notification_class' => $notificationClass,
            ]);

            return [
                'success' => true,
                'user_id' => $user->id,
                'email' => $user->email,
                'notification_class' => $notificationClass,
                'verification_url' => $verificationUrl,
            ];
        } catch (Throwable $exception) {
            Log::error('Email verification email failed', [
                'source' => $source,
                'user_id' => $user->id,
                'email' => $user->email,
                'mail_recipient' => $mailRecipient,
                'notification_class' => $notificationClass,
                'exception_class' => $exception::class,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
            ]);

            throw $exception;
        }
    }

    public function verificationUrl(User $user): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $user->getKey(),
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );
    }
}
