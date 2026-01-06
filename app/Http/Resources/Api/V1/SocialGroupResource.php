<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class SocialGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'cover_image' => $this->cover_image,
            'creator_id' => $this->creator_id,
            'privacy' => $this->privacy,
            'is_active' => $this->is_active,
            'members_count' => $this->membersCount(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'creator' => new UserResource($this->whenLoaded('creator')),
        ];
    }
}


