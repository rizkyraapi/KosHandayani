<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'job',
        'address',
        'profile_completed',
        'profile_photo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'profile_completed' => 'boolean',
        ];
    }

    public function isProfileComplete(): bool
    {
        return filled($this->phone)
            && filled($this->job)
            && filled($this->address);
    }

    public function toProfileArray(): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->name,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'whatsapp' => $this->phone,
            'phone' => $this->phone,
            'pekerjaan' => $this->job,
            'job' => $this->job,
            'address' => $this->address,
            'profile_completed' => $this->isProfileComplete(),
            'email_verified' => $this->hasVerifiedEmail(),
            'email_verified_at' => optional($this->email_verified_at)->toDateTimeString(),
            'profile_photo' => $this->profile_photo,
            'profile_photo_url' => $this->profile_photo
                ? url('storage/'.$this->profile_photo)
                : null,
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }

    public function rentalApplications(): HasMany
    {
        return $this->hasMany(RentalApplication::class);
    }

    public function roomOccupancies(): HasMany
    {
        return $this->hasMany(RoomOccupancy::class);
    }

    public function createdExpenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'created_by');
    }
}
