<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TractorWork extends Model
{
    use HasFactory, BelongsToUser;

    protected $fillable = [
        'user_id',
        'work_category',
        'customer_name',
        'customer_phone',
        'operation_type',
        'trips_count',
        'calc_basis',
        'units_count',
        'rate_per_unit',
        'total_amount',
        'payment_status',
        'paid_amount',
        'work_date',
        'notes',
    ];

    protected $casts = [
        'trips_count' => 'integer',
        'units_count' => 'decimal:2',
        'rate_per_unit' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'work_date' => 'date:Y-m-d',
    ];
}
