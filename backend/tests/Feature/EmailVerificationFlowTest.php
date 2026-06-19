<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Mockery;
use Tests\TestCase;

class EmailVerificationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_sends_verification_email(): void
    {
        Notification::fake();

        $this
            ->postJson('/api/register', [
                'name' => 'Tenant Verify',
                'phone' => '08123456789',
                'email' => 'verify@example.com',
                'password' => 'Password1',
                'password_confirmation' => 'Password1',
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $user = User::where('email', 'verify@example.com')->firstOrFail();

        $this->assertNull($user->email_verified_at);
        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_tenant_can_resend_verification_email(): void
    {
        Notification::fake();
        $tenant = User::factory()->unverified()->create(['role' => 'tenant']);

        $this
            ->actingAs($tenant)
            ->postJson('/api/email/resend-verification')
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Link verifikasi berhasil dikirim',
            ]);

        Notification::assertSentTo($tenant, VerifyEmailNotification::class);
    }

    public function test_debug_email_verification_endpoint_returns_signed_url_and_sends_notification(): void
    {
        Notification::fake();
        $tenant = User::factory()->unverified()->create(['role' => 'tenant']);

        $this
            ->getJson('/api/debug/email-verification/'.$tenant->id)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user_id', $tenant->id)
            ->assertJsonPath('data.email', $tenant->email)
            ->assertJsonPath('data.verified', false)
            ->assertJsonPath('data.implements_must_verify_email', true)
            ->assertJsonPath('data.simulation.success', true)
            ->assertJsonPath('data.simulation.notification_class', VerifyEmailNotification::class)
            ->assertJsonPath('data.signed_verification_url', fn (string $url): bool => str_contains($url, '/api/email/verify/'.$tenant->id.'/'));

        Notification::assertSentTo($tenant, VerifyEmailNotification::class);
    }

    public function test_unverified_tenant_and_owner_can_still_login(): void
    {
        foreach (['tenant', 'owner'] as $role) {
            $user = User::factory()->unverified()->create([
                'role' => $role,
                'email' => $role.'-unverified@example.com',
            ]);

            $this
                ->postJson('/api/login', [
                    'email' => $user->email,
                    'password' => 'password',
                ])
                ->assertOk()
                ->assertJsonPath('success', true)
                ->assertJsonPath('message', 'Login berhasil')
                ->assertJsonPath('user.role', $role)
                ->assertJsonPath('user.email_verified', false);
        }
    }

    public function test_email_verification_link_marks_user_verified_and_redirects(): void
    {
        $tenant = User::factory()->unverified()->create(['role' => 'tenant']);
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $tenant->id,
                'hash' => sha1($tenant->getEmailForVerification()),
            ],
        );

        $this
            ->get($url)
            ->assertRedirect(rtrim(config('app.frontend_url'), '/').'/email-verification/success');

        $this->assertTrue($tenant->fresh()->hasVerifiedEmail());
    }

    public function test_verification_status_endpoint_returns_boolean_status(): void
    {
        $tenant = User::factory()->unverified()->create(['role' => 'tenant']);

        $this
            ->actingAs($tenant)
            ->getJson('/api/email/verification-status')
            ->assertOk()
            ->assertJson(['verified' => false]);

        $tenant->markEmailAsVerified();

        $this
            ->actingAs($tenant->fresh())
            ->getJson('/api/email/verification-status')
            ->assertOk()
            ->assertJson(['verified' => true]);
    }

    public function test_unverified_user_cannot_create_rental_application(): void
    {
        $tenant = User::factory()->unverified()->create([
            'role' => 'tenant',
            'phone' => '08123456789',
            'job' => 'Mahasiswa',
            'address' => 'Jl. Test',
        ]);
        $room = $this->createRoom();

        $this
            ->actingAs($tenant)
            ->postJson('/api/rental-applications', [
                'room_id' => $room->id,
                'move_in_date' => '2026-06-10',
                'duration' => '3 Bulan',
            ])
            ->assertForbidden()
            ->assertJson([
                'message' => 'Silakan verifikasi email terlebih dahulu',
            ]);
    }

    public function test_verified_user_can_create_rental_application(): void
    {
        Storage::fake('public');
        $tenant = User::factory()->create([
            'role' => 'tenant',
            'phone' => '08123456789',
            'job' => 'Mahasiswa',
            'address' => 'Jl. Test',
        ]);
        $room = $this->createRoom();

        $this
            ->actingAs($tenant)
            ->postJson('/api/rental-applications', [
                'room_id' => $room->id,
                'move_in_date' => '2026-06-10',
                'duration' => '6 Bulan',
                'ktp_file' => UploadedFile::fake()->create('ktp.pdf', 100, 'application/pdf'),
                'kk_file' => UploadedFile::fake()->create('kk.pdf', 100, 'application/pdf'),
            ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.payment_status', 'pending');

        $application = RentalApplication::where('user_id', $tenant->id)->firstOrFail();

        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'duration' => '6 Bulan',
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);
        Storage::disk('public')->assertExists($application->ktp_file);
        Storage::disk('public')->assertExists($application->kk_file);
    }

    public function test_unverified_user_cannot_create_payment(): void
    {
        $tenant = User::factory()->unverified()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = RentalApplication::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'move_in_date' => '2026-06-10',
            'duration' => '3 Bulan',
            'status' => 'approved',
            'payment_status' => 'unpaid',
            'approved_at' => now(),
        ]);

        Payment::create([
            'rental_application_id' => $application->id,
            'order_id' => 'KH-'.$application->id.'-unverified',
            'subtotal_amount' => 1500000,
            'discount_amount' => 100000,
            'gross_amount' => 1400000,
            'transaction_status' => 'pending',
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldNotReceive('createSnapToken');
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/create', [
                'rental_application_id' => $application->id,
            ])
            ->assertForbidden()
            ->assertJson([
                'message' => 'Silakan verifikasi email terlebih dahulu',
            ]);
    }

    public function test_verified_user_can_create_payment(): void
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $room = $this->createRoom();
        $application = RentalApplication::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'move_in_date' => '2026-06-10',
            'duration' => '3 Bulan',
            'status' => 'approved',
            'payment_status' => 'unpaid',
            'approved_at' => now(),
        ]);

        $midtrans = Mockery::mock(MidtransService::class);
        $midtrans->shouldReceive('createSnapToken')
            ->once()
            ->andReturn('verified-user-snap-token');
        $this->app->instance(MidtransService::class, $midtrans);

        $this
            ->actingAs($tenant)
            ->postJson('/api/payments/create', [
                'rental_application_id' => $application->id,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('snap_token', 'verified-user-snap-token');

        $this->assertDatabaseHas('payments', [
            'rental_application_id' => $application->id,
            'subtotal_amount' => 1500000,
            'discount_amount' => 100000,
            'gross_amount' => 1400000,
            'transaction_status' => 'pending',
        ]);
    }

    private function createRoom(): Room
    {
        return Room::create([
            'room_name' => 'Kamar Verification',
            'branch' => 'Cabang Utama',
            'gender_type' => 'mixed',
            'room_status' => 'available',
            'price' => 500000,
            'max_guest' => 1,
            'is_available' => true,
        ]);
    }
}
