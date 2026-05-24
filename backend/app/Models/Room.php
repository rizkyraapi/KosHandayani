<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = [
        'room_name',
        'branch_id',
        'room_type',
        'branch',
        'gender_type',
        'description',
        'thumbnail',
        'max_guest',
        'price',
        'room_status',
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

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function facilities(): HasMany
    {
        return $this->hasMany(RoomFacility::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(RoomImage::class)
            ->orderByDesc('is_primary')
            ->orderBy('id');
    }

    public function rentalApplications(): HasMany
    {
        return $this->hasMany(RentalApplication::class);
    }
}
