<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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
        $user = User::factory()->create(['role' => 'tenant']);
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
        $this->app['auth']->forgetGuards();

        $this
            ->withToken($token)
            ->getJson('/api/me')
            ->assertUnauthorized();
    }
}
