<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function personalRecords()
    {
        return $this->hasMany(PersonalRecord::class);
    }

    public function familyMemberships()
    {
        return $this->hasMany(FamilyMember::class);
    }

    public function families()
    {
        return $this->belongsToMany(Family::class, 'family_members')->withPivot('relation_title_gu', 'is_admin');
    }

    public function fcmTokens()
    {
        return $this->hasMany(FcmToken::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
