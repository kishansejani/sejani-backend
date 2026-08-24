<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmProduction extends Model
{
    use HasFactory, BelongsToUser;

    protected $fillable = [
        'user_id',
        'crop_id',
        'crop_name_gu',
        'quantity',
        'unit',
        'rate_per_unit',
        'total_amount',
        'equivalent_man',
        'equivalent_kg',
        'buyer_name',
        'sale_date',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'rate_per_unit' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'equivalent_man' => 'decimal:2',
        'equivalent_kg' => 'decimal:2',
        'sale_date' => 'date:Y-m-d',
    ];

    public function crop()
    {
        return $this->belongsTo(FarmCrop::class, 'crop_id');
    }
}
