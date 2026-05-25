<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ChangePasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_change_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $this
            ->actingAs($user)
            ->putJson('/api/change-password', [
                'current_password' => 'old-password',
                'new_password' => 'new-password',
                'new_password_confirmation' => 'new-password',
            ])
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Password changed successfully',
            ]);

        $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
    }

    public function test_change_password_rejects_incorrect_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $this
            ->actingAs($user)
            ->putJson('/api/change-password', [
                'current_password' => 'wrong-password',
                'new_password' => 'new-password',
                'new_password_confirmation' => 'new-password',
            ])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Current password is incorrect',
            ]);

        $this->assertTrue(Hash::check('old-password', $user->refresh()->password));
    }

    public function test_change_password_validates_confirmation(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $this
            ->actingAs($user)
            ->putJson('/api/change-password', [
                'current_password' => 'old-password',
                'new_password' => 'new-password',
                'new_password_confirmation' => 'different-password',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);
    }
}
