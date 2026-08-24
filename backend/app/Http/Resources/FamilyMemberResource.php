<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FamilyMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->user?->name,
            'phone' => $this->user?->phone,
            'email' => $this->user?->email,
            'relation_title_gu' => $this->relation_title_gu,
            'is_admin' => (bool)$this->is_admin,
            'profile' => [
                'full_name_gu' => $this->user?->profile?->full_name_gu ?? $this->user?->name,
                'full_name_en' => $this->user?->profile?->full_name_en,
                'birth_date' => $this->user?->profile?->birth_date?->format('Y-m-d'),
                'blood_group' => $this->user?->profile?->blood_group,
                'occupation_gu' => $this->user?->profile?->occupation_gu,
                'avatar' => $this->user?->profile?->avatar,
                'bio_gu' => $this->user?->profile?->bio_gu,
                'emergency_contact' => $this->user?->profile?->emergency_contact,
            ],
        ];
    }
}
