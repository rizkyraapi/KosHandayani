<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    public function __construct(private readonly string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(User $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        $resetUrl = rtrim(config('app.frontend_url'), '/').'/reset-password?token='.
            urlencode($this->token).'&email='.urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Reset Kata Sandi KosHandayani')
            ->view('emails.password-reset', [
                'userName' => $notifiable->name,
                'resetUrl' => $resetUrl,
            ])
            ->tag('password-reset')
            ->metadata('user_id', (string) $notifiable->id);
    }
}
