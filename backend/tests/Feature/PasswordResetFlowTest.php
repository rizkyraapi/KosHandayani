<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_reset_link_with_generic_response(): void
    {
        Notification::fake();
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'role' => 'tenant',
        ]);

        $this
            ->postJson('/api/forgot-password', [
                'email' => 'reset@example.com',
            ])
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Jika email terdaftar, tautan reset password telah dikirim.',
            ]);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_forgot_password_does_not_reveal_unknown_email(): void
    {
        Notification::fake();

        $this
            ->postJson('/api/forgot-password', [
                'email' => 'unknown@example.com',
            ])
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Jika email terdaftar, tautan reset password telah dikirim.',
            ]);

        Notification::assertNothingSent();
    }

    public function test_password_can_be_reset_and_token_is_single_use(): void
    {
        $user = User::factory()->create([
            'email' => 'single-use@example.com',
            'password' => Hash::make('Password1'),
            'role' => 'tenant',
        ]);
        $token = Password::broker()->createToken($user);

        $this
            ->postJson('/api/reset-password', [
                'token' => $token,
                'email' => 'single-use@example.com',
                'password' => 'NewPassword1',
                'password_confirmation' => 'NewPassword1',
            ])
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Kata sandi berhasil diperbarui.',
            ]);

        $this->assertTrue(Hash::check('NewPassword1', $user->fresh()->password));

        $this
            ->postJson('/api/reset-password', [
                'token' => $token,
                'email' => 'single-use@example.com',
                'password' => 'AnotherPassword1',
                'password_confirmation' => 'AnotherPassword1',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false);
    }

    public function test_invalid_reset_token_is_rejected(): void
    {
        User::factory()->create([
            'email' => 'invalid-token@example.com',
            'password' => Hash::make('Password1'),
            'role' => 'tenant',
        ]);

        $this
            ->postJson('/api/reset-password', [
                'token' => 'invalid-token',
                'email' => 'invalid-token@example.com',
                'password' => 'NewPassword1',
                'password_confirmation' => 'NewPassword1',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Token reset password tidak valid atau sudah kedaluwarsa.');
    }

    public function test_expired_reset_token_is_rejected(): void
    {
        $user = User::factory()->create([
            'email' => 'expired-token@example.com',
            'password' => Hash::make('Password1'),
            'role' => 'tenant',
        ]);
        $token = Password::broker()->createToken($user);

        $this->travel(61)->minutes();

        $this
            ->postJson('/api/reset-password', [
                'token' => $token,
                'email' => 'expired-token@example.com',
                'password' => 'NewPassword1',
                'password_confirmation' => 'NewPassword1',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false);

        $this->assertTrue(Hash::check('Password1', $user->fresh()->password));
    }

    public function test_password_reset_email_template_contains_koshandayani_content(): void
    {
        $html = view('emails.password-reset', [
            'userName' => 'Rizky Ramadhan',
            'resetUrl' => 'https://koshandayani.test/reset-password?token=abc&email=tenant%40example.com',
        ])->render();

        $this->assertStringContainsString('Reset Kata Sandi', $html);
        $this->assertStringContainsString('Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda.', $html);
        $this->assertStringContainsString('KosHandayani', $html);
        $this->assertStringContainsString('Jika Anda tidak meminta reset password, abaikan email ini.', $html);
    }
}
