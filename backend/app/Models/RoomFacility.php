<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomFacility extends Model
{
    protected $fillable = [
        'room_id',
        'facility_name',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
