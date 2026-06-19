<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailNotification extends Notification
{
    public function __construct(private readonly string $verificationUrl) {}

    /**
     * @return array<int, string>
     */
    public function via(User $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage)
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Verifikasi Akun KosHandayani')
            ->view('emails.verification', [
                'userName' => $notifiable->name,
                'verificationUrl' => $this->verificationUrl,
            ])
            ->tag('email-verification')
            ->metadata('user_id', (string) $notifiable->id);
    }
}
