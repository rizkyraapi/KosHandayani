<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasFactory;

    public const CATEGORIES = [
        'Perawatan',
        'Utilitas',
        'Internet',
        'Kebersihan',
        'Keamanan',
        'Perlengkapan',
        'Pajak',
        'Lainnya',
    ];

    protected $fillable = [
        'branch_id',
        'category',
        'description',
        'amount',
        'receipt_path',
        'expense_date',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'expense_date' => 'date',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
