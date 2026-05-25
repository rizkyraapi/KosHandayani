<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // REGISTER TENANT
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),

            // otomatis tenant
            'role' => 'tenant',

            // profile belum lengkap
            'profile_completed' => false,
        ]);

        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'success' => true,
            'message' => 'Register berhasil',
            'user' => $this->authUser($user),
        ]);
    }

    // LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember' => 'sometimes|boolean',
        ]);

        $user = User::where('email', $request->email)->first();

        // cek user
        if (!$user || !Hash::check($request->password, $user->password)) {

            throw ValidationException::withMessages([
                'email' => ['Email atau password salah'],
            ]);
        }

        $remember = $request->boolean('remember');

        if ($remember) {
            config(['session.lifetime' => 60 * 24 * 30]);
        }

        Auth::login($user, $remember);
        if ($request->hasSession()) {
            $request->session()->regenerate();
            $request->session()->put('remember_me', $remember);
        }

        return response()->json([

            'success' => true,
            'message' => 'Login berhasil',

            'user' => $this->authUser($user),
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

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
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    private function authUser(User $user): array
    {
        return $user->toProfileArray();
    }
}
