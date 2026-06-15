<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'rental_application_id',
        'subtotal_amount',
        'discount_amount',
        'order_id',
        'transaction_id',
        'gross_amount',
        'payment_type',
        'transaction_status',
        'snap_token',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_amount' => 'integer',
            'discount_amount' => 'integer',
            'gross_amount' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    public function rentalApplication(): BelongsTo
    {
        return $this->belongsTo(RentalApplication::class);
    }
}
