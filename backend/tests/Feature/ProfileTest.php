<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_can_upload_profile_photo(): void
    {
        Storage::fake('public');
        $photoPath = tempnam(sys_get_temp_dir(), 'profile-photo-');

        file_put_contents(
            $photoPath,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=')
        );

        $user = User::factory()->create([
            'role' => 'tenant',
            'phone' => null,
            'job' => null,
            'address' => null,
            'profile_photo' => null,
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/api/profile', [
                '_method' => 'PUT',
                'full_name' => 'Tenant Test',
                'whatsapp' => '08123456789',
                'pekerjaan' => 'Mahasiswa',
                'address' => 'Jl. Test',
                'profile_photo' => new UploadedFile($photoPath, 'avatar.png', 'image/png', null, true),
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.full_name', 'Tenant Test')
            ->assertJsonPath('data.profile_photo_url', fn ($url) => is_string($url) && str_contains($url, '/storage/profile_photos/'));

        $user->refresh();

        $this->assertNotNull($user->profile_photo);
        Storage::disk('public')->assertExists($user->profile_photo);
    }
}
