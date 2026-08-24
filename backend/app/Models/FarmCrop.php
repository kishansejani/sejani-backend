<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmCrop extends Model
{
    use HasFactory, BelongsToUser;

    protected $fillable = [
        'user_id',
        'farm_id',
        'crop_name_gu',
        'season',
        'sowing_date',
        'harvest_date',
        'status',
    ];

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }

    public function productions()
    {
        return $this->hasMany(FarmProduction::class, 'crop_id');
    }

    public function expenses()
    {
        return $this->hasMany(FarmExpense::class, 'crop_id');
    }
}
