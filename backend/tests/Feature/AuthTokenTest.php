<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthTokenTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_sanctum_token_and_user(): void
    {
        $user = User::factory()->create([
            'email' => 'tenant@example.com',
            'password' => Hash::make('Password1'),
            'role' => 'tenant',
        ]);

        $this
            ->postJson('/api/login', [
                'email' => 'tenant@example.com',
                'password' => 'Password1',
            ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Login berhasil')
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'tenant@example.com')
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'email', 'role'],
            ]);
    }

    public function test_login_with_remember_sets_laravel_remember_token_and_long_lived_sanctum_token(): void
    {
        $user = User::factory()->create([
            'email' => 'remember@example.com',
            'password' => Hash::make('Password1'),
            'role' => 'tenant',
            'remember_token' => null,
        ]);

        $this
            ->postJson('/api/login', [
                'email' => 'remember@example.com',
                'password' => 'Password1',
                'remember' => true,
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertNotNull($user->fresh()->remember_token);

        $token = PersonalAccessToken::query()->firstOrFail();
        $this->assertNotNull($token->expires_at);
        $this->assertTrue($token->expires_at->greaterThan(now()->addDays(29)));
    }

    public function test_login_without_remember_clears_remember_token_and_keeps_short_lived_sanctum_token(): void
    {
        $user = User::factory()->create([
            'email' => 'no-remember@example.com',
            'password' => Hash::make('Password1'),
            'role' => 'tenant',
            'remember_token' => 'existing-token',
        ]);

        $this
            ->postJson('/api/login', [
                'email' => 'no-remember@example.com',
                'password' => 'Password1',
                'remember' => false,
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertNull($user->fresh()->remember_token);

        $token = PersonalAccessToken::query()->firstOrFail();
        $this->assertNotNull($token->expires_at);
        $this->assertTrue($token->expires_at->lessThan(now()->addMinutes(121)));
    }

    public function test_register_returns_sanctum_token_and_user(): void
    {
        $this
            ->postJson('/api/register', [
                'name' => 'Tenant Baru',
                'phone' => '08123456789',
                'email' => 'new-tenant@example.com',
                'password' => 'Password1',
                'password_confirmation' => 'Password1',
            ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Register berhasil')
            ->assertJsonPath('user.email', 'new-tenant@example.com')
            ->assertJsonPath('user.role', 'tenant')
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'email', 'role'],
            ]);
    }

    public function test_bearer_token_can_access_protected_me_endpoint_and_logout_revokes_token(): void
    {
        $user = User::factory()->create([
            'role' => 'tenant',
            'remember_token' => 'active-remember-token',
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        $this
            ->withToken($token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);

        $this
            ->withToken($token)
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Logout berhasil',
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertNull($user->fresh()->remember_token);
        $this->app['auth']->forgetGuards();

        $this
            ->withToken($token)
            ->getJson('/api/me')
            ->assertUnauthorized();
    }
}
