<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    public const CATEGORY_INITIAL_RENT = 'initial_rent';

    public const CATEGORY_RENEWAL = 'renewal';

    protected $fillable = [
        'rental_application_id',
        'payment_category',
        'room_occupancy_id',
        'subtotal_amount',
        'discount_amount',
        'duration_months',
        'monthly_price',
        'period_start',
        'period_end',
        'order_id',
        'transaction_id',
        'gross_amount',
        'payment_type',
        'transaction_status',
        'snap_token',
        'paid_at',
        'settlement_time',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_amount' => 'integer',
            'discount_amount' => 'integer',
            'duration_months' => 'integer',
            'monthly_price' => 'integer',
            'gross_amount' => 'integer',
            'period_start' => 'date',
            'period_end' => 'date',
            'paid_at' => 'datetime',
            'settlement_time' => 'datetime',
        ];
    }

    public function rentalApplication(): BelongsTo
    {
        return $this->belongsTo(RentalApplication::class);
    }

    public function roomOccupancy(): BelongsTo
    {
        return $this->belongsTo(RoomOccupancy::class);
    }
}
