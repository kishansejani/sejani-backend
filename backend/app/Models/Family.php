<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Family extends Model
{
    use HasFactory;

    protected $fillable = [
        'family_name_gu',
        'family_name_en',
        'family_code',
        'head_user_id',
        'description_gu',
    ];

    public function head()
    {
        return $this->belongsTo(User::class, 'head_user_id');
    }

    public function members()
    {
        return $this->hasMany(FamilyMember::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'family_members')->withPivot('relation_title_gu', 'is_admin');
    }
}
