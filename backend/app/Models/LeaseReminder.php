<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaseReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_occupancy_id',
        'user_id',
        'channel',
        'reminder_type',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }

    public function roomOccupancy(): BelongsTo
    {
        return $this->belongsTo(RoomOccupancy::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
