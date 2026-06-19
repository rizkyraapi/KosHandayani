<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RentalApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'room_id',
        'move_in_date',
        'duration',
        'ktp_file',
        'kk_file',
        'status',
        'owner_notes',
        'payment_status',
        'approved_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'move_in_date' => 'date',
            'approved_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class)
            ->where('payment_category', Payment::CATEGORY_INITIAL_RENT);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function renewalPayments(): HasMany
    {
        return $this->hasMany(Payment::class)
            ->where('payment_category', Payment::CATEGORY_RENEWAL);
    }

    public function roomOccupancy(): HasOne
    {
        return $this->hasOne(RoomOccupancy::class);
    }
}
