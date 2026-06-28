<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailVerificationNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;
use Throwable;

class AuthController extends Controller
{
    public function __construct(
        private readonly EmailVerificationNotificationService $emailVerificationNotifications,
    ) {}

    // REGISTER TENANT
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'max:30', 'regex:/^(\+62|62|0)8[0-9]{8,13}$/'],
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),

            // otomatis tenant
            'role' => 'tenant',

            // profile belum lengkap
            'profile_completed' => false,
        ]);

        $verificationEmailSent = true;

        try {
            $this->emailVerificationNotifications->send($user, 'register');

            Log::info('Email verification notification sent after registration', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (Throwable $exception) {
            $verificationEmailSent = false;

            Log::warning('Registration completed but verification email could not be sent', [
                'user_id' => $user->id,
                'email' => $user->email,
                'exception_class' => $exception::class,
            ]);
        }

        $token = $user->createToken(
            'auth_token',
            ['*'],
            now()->addMinutes(120),
        )->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => $verificationEmailSent
                ? 'Register berhasil'
                : 'Register berhasil. Email verifikasi belum dapat dikirim, silakan kirim ulang dari halaman profil.',
            'token' => $token,
            'user' => $this->authUser($user),
        ]);
    }

    // LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember' => ['nullable', 'boolean'],
        ]);

        $user = User::where('email', $request->email)->first();

        // cek user
        if (! $user || ! Hash::check($request->password, $user->password)) {

            throw ValidationException::withMessages([
                'email' => [__('validation.custom.email.credentials')],
            ]);
        }

        if ($request->boolean('remember')) {
            $user->forceFill([
                'remember_token' => Str::random(60),
            ])->save();
        } else {
            $user->forceFill([
                'remember_token' => null,
            ])->save();
        }

        $token = $user->createToken(
            'auth_token',
            ['*'],
            $request->boolean('remember') ? now()->addDays(30) : now()->addMinutes(120),
        )->plainTextToken;

        return response()->json([

            'success' => true,
            'message' => 'Login berhasil',

            'token' => $token,
            'user' => $this->authUser($user),
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $accessToken = $request->bearerToken()
            ? PersonalAccessToken::findToken($request->bearerToken())
            : $request->user()->currentAccessToken();

        $accessToken?->delete();
        $request->user()?->forceFill([
            'remember_token' => null,
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    // GET USER LOGIN
    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->authUser($request->user()),
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => __('validation.custom.current_password.current'),
                'errors' => [
                    'current_password' => [__('validation.custom.current_password.current')],
                ],
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        $currentToken = $request->user()->currentAccessToken();
        $currentTokenId = $currentToken instanceof PersonalAccessToken
            ? $currentToken->getKey()
            : null;
        $user->tokens()
            ->when($currentTokenId, fn ($query) => $query->where('id', '!=', $currentTokenId))
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diubah',
        ]);
    }

    private function authUser(User $user): array
    {
        return $user->toProfileArray();
    }
}
