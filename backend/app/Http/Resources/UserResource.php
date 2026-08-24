<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'profile' => [
                'full_name_gu' => $this->profile?->full_name_gu ?? $this->name,
                'full_name_en' => $this->profile?->full_name_en,
                'birth_date' => $this->profile?->birth_date?->format('Y-m-d'),
                'blood_group' => $this->profile?->blood_group,
                'occupation_gu' => $this->profile?->occupation_gu,
                'avatar' => $this->profile?->avatar,
                'bio_gu' => $this->profile?->bio_gu,
                'emergency_contact' => $this->profile?->emergency_contact,
            ],
            'family' => $this->families->first() ? [
                'id' => $this->families->first()->id,
                'name_gu' => $this->families->first()->family_name_gu,
                'family_code' => $this->families->first()->family_code,
                'relation_title_gu' => $this->families->first()->pivot?->relation_title_gu,
                'is_admin' => (bool)$this->families->first()->pivot?->is_admin,
            ] : null,
        ];
    }
}
