<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory, BelongsToUser;

    protected $fillable = [
        'user_id',
        'title',
        'category',
        'amount',
        'task_date',
        'task_time',
        'reminder_datetime',
        'is_completed',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_completed' => 'boolean',
        'task_date' => 'date:Y-m-d',
        'reminder_datetime' => 'datetime',
    ];
}
