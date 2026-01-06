<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BusinessTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'industry_id' => $this->industry_id,
            'layout_config' => $this->layout_config,
            'available_tabs' => $this->available_tabs,
            'default_tabs' => $this->default_tabs,
            'ai_features' => $this->ai_features,
            'theme_config' => $this->theme_config,
            'is_premium' => $this->is_premium,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}


