<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalRecord extends Model
{
    use HasFactory, BelongsToUser;

    protected $fillable = [
        'user_id',
        'record_type',
        'title',
        'content',
        'amount',
        'category',
        'record_date',
        'is_pinned',
        'is_locked',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'record_date' => 'date:Y-m-d',
        'is_pinned' => 'boolean',
        'is_locked' => 'boolean',
    ];
}
