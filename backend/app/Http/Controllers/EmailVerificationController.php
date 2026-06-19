<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\EmailVerificationNotificationService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class EmailVerificationController extends Controller
{
    public function __construct(
        private readonly EmailVerificationNotificationService $emailVerificationNotifications,
    ) {}

    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasVerifiedEmail()) {
            try {
                $this->emailVerificationNotifications->send($user, 'resend');
            } catch (Throwable $exception) {
                return response()->json([
                    'success' => false,
                    'message' => $exception->getMessage(),
                ], 500);
            }

            Log::info('Email verification link resent', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Link verifikasi berhasil dikirim',
        ]);
    }

    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'verified' => (bool) $request->user()?->hasVerifiedEmail(),
        ]);
    }

    public function debug(int $userId): JsonResponse
    {
        abort_unless(app()->environment(['local', 'testing']), 404);

        $user = User::findOrFail($userId);
        $verificationUrl = $this->emailVerificationNotifications->verificationUrl($user);

        try {
            $sendResult = $this->emailVerificationNotifications->send($user, 'debug-email-verification-endpoint');

            $simulation = [
                'success' => true,
                'message' => 'Verification email sent successfully',
                'notification_class' => $sendResult['notification_class'],
                'sent_at' => now()->toDateTimeString(),
            ];
        } catch (Throwable $exception) {
            $simulation = [
                'success' => false,
                'message' => $exception->getMessage(),
                'exception_class' => $exception::class,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $user->id,
                'email' => $user->email,
                'verified' => $user->hasVerifiedEmail(),
                'email_verified_at' => optional($user->email_verified_at)->toDateTimeString(),
                'implements_must_verify_email' => $user instanceof MustVerifyEmail,
                'signed_verification_url' => $verificationUrl,
                'mail' => [
                    'mailer' => config('mail.default'),
                    'host' => config('mail.mailers.'.config('mail.default').'.host'),
                    'port' => config('mail.mailers.'.config('mail.default').'.port'),
                    'from_address' => config('mail.from.address'),
                    'from_name' => config('mail.from.name'),
                    'route_recipient' => $user->routeNotificationFor('mail'),
                ],
                'simulation' => $simulation,
            ],
        ]);
    }

    public function verify(Request $request, int $id, string $hash): RedirectResponse
    {
        $user = User::findOrFail($id);

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            Log::warning('Email verification hash mismatch', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            abort(403);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));

            Log::info('Email verified successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }

        return redirect()->away(rtrim(config('app.frontend_url'), '/').'/email-verification/success');
    }
}
