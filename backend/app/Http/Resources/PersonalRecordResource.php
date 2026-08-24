<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonalRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'record_type' => $this->record_type,
            'title' => $this->title,
            'content' => $this->content,
            'amount' => $this->amount !== null ? (float)$this->amount : null,
            'category' => $this->category ?? 'general',
            'record_date' => $this->record_date?->format('Y-m-d'),
            'is_pinned' => (bool)$this->is_pinned,
            'is_locked' => (bool)$this->is_locked,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
