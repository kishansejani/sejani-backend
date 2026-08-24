<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmExpense extends Model
{
    use HasFactory, BelongsToUser;

    protected $fillable = [
        'user_id',
        'crop_id',
        'expense_type',
        'title_gu',
        'amount',
        'quantity_or_hours',
        'unit_rate',
        'expense_date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'quantity_or_hours' => 'decimal:2',
        'unit_rate' => 'decimal:2',
        'expense_date' => 'date:Y-m-d',
    ];

    public function crop()
    {
        return $this->belongsTo(FarmCrop::class, 'crop_id');
    }
}
