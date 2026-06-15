<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\RentalApplication;
use App\Models\Room;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
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
        Notification::assertSentTo($user, VerifyEmail::class);
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

        Notification::assertSentTo($tenant, VerifyEmail::class);
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

    private function createRoom(): Room
    {
        return Room::create([
            'room_name' => 'Kamar Verification',
            'branch' => 'Cabang Utama',
            'room_type' => 'single',
            'gender_type' => 'mixed',
            'room_status' => 'available',
            'price' => 500000,
            'max_guest' => 1,
            'is_available' => true,
        ]);
    }
}
