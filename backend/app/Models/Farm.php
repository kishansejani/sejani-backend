<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Farm extends Model
{
    use HasFactory, BelongsToUser;

    protected $fillable = [
        'user_id',
        'name_gu',
        'village',
        'survey_number',
        'area_vigha',
        'notes',
    ];

    public function crops()
    {
        return $this->hasMany(FarmCrop::class);
    }
}
