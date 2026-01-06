<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AchievementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_id' => $this->business_id,
            'title' => $this->title,
            'description' => $this->description,
            'source_name' => $this->source_name,
            'source_url' => $this->source_url,
            'achievement_type' => $this->achievement_type,
            'achievement_date' => $this->achievement_date?->toISOString(),
            'expiration_date' => $this->expiration_date?->toISOString(),
            'icon' => $this->icon,
            'badge_image_url' => $this->badge_image_url,
            'is_verified' => $this->is_verified,
            'display_order' => $this->display_order,
            'is_featured' => $this->is_featured,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}


