<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationController extends Controller
{
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();

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

    public function verify(Request $request, int $id, string $hash): RedirectResponse
    {
        $user = User::findOrFail($id);

        abort_unless(hash_equals($hash, sha1($user->getEmailForVerification())), 403);

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
