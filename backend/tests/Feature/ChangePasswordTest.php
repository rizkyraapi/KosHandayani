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
                'new_password' => 'Newpassword1',
                'new_password_confirmation' => 'Newpassword1',
            ])
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Kata sandi berhasil diubah',
            ]);

        $this->assertTrue(Hash::check('Newpassword1', $user->refresh()->password));
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
                'new_password' => 'Newpassword1',
                'new_password_confirmation' => 'Newpassword1',
            ])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Kata sandi saat ini tidak sesuai.',
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
                'new_password' => 'Newpassword1',
                'new_password_confirmation' => 'different-password',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);
    }

    public function test_change_password_requires_capital_letter_and_number(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $this
            ->actingAs($user)
            ->putJson('/api/change-password', [
                'current_password' => 'old-password',
                'new_password' => 'weakpassword',
                'new_password_confirmation' => 'weakpassword',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);

        $this->assertTrue(Hash::check('old-password', $user->refresh()->password));
    }
}
