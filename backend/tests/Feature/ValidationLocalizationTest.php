<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ValidationLocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_validation_uses_indonesian_messages(): void
    {
        $this
            ->postJson('/api/register', [])
            ->assertStatus(422)
            ->assertJsonPath('errors.name.0', 'Nama wajib diisi.')
            ->assertJsonPath('errors.phone.0', 'Nomor WhatsApp wajib diisi.')
            ->assertJsonPath('errors.email.0', 'Email wajib diisi.')
            ->assertJsonPath('errors.password.0', 'Kata sandi wajib diisi.');
    }

    public function test_login_validation_uses_indonesian_messages(): void
    {
        $this
            ->postJson('/api/login', [
                'email' => 'bukan-email',
            ])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Email harus berupa alamat email yang valid.')
            ->assertJsonPath('errors.password.0', 'Kata sandi wajib diisi.');
    }

    public function test_profile_validation_uses_indonesian_messages(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);

        $this
            ->actingAs($tenant)
            ->postJson('/api/profile', [])
            ->assertStatus(422)
            ->assertJsonPath('errors.full_name.0', 'Nama lengkap wajib diisi.')
            ->assertJsonPath('errors.whatsapp.0', 'Nomor WhatsApp wajib diisi.')
            ->assertJsonPath('errors.pekerjaan.0', 'Pekerjaan wajib diisi.')
            ->assertJsonPath('errors.address.0', 'Alamat wajib diisi.');
    }

    public function test_rental_application_validation_uses_indonesian_messages(): void
    {
        $tenant = User::factory()->create([
            'role' => 'tenant',
            'phone' => '08123456789',
            'job' => 'Mahasiswa',
            'address' => 'Jl. Test',
        ]);

        $this
            ->actingAs($tenant)
            ->postJson('/api/rental-applications', [])
            ->assertStatus(422)
            ->assertJsonPath('data.errors.room_id.0', 'Kamar wajib diisi.')
            ->assertJsonPath('data.errors.move_in_date.0', 'Tanggal masuk wajib diisi.')
            ->assertJsonPath('data.errors.duration.0', 'Durasi sewa wajib diisi.')
            ->assertJsonPath('data.errors.ktp_file.0', 'File KTP wajib diisi.')
            ->assertJsonPath('data.errors.kk_file.0', 'File KK wajib diisi.');
    }

    public function test_payment_validation_uses_indonesian_messages(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/create', [])
            ->assertStatus(422)
            ->assertJsonPath('errors.rental_application_id.0', 'Pengajuan sewa wajib diisi.');
    }
}
