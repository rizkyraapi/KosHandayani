<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected function casts(): array
    {
        return [
            'move_in_date' => 'date',
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
}
