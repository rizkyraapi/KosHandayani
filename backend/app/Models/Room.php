<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = [
        'room_name',
        'room_type',
        'price',
        'branch',
        'description',
        'thumbnail',
        'max_guest',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'max_guest' => 'integer',
            'is_available' => 'boolean',
        ];
    }

    public function facilities(): HasMany
    {
        return $this->hasMany(RoomFacility::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(RoomImage::class);
    }
}
