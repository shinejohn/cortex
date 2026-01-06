<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class ClassifiedResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'workspace_id' => $this->workspace_id,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'price_type' => $this->price_type,
            'condition' => $this->condition,
            'location' => $this->location,
            'is_featured' => $this->is_featured,
            'status' => $this->status,
            'posted_at' => $this->posted_at?->toISOString(),
            'expires_at' => $this->expires_at?->toISOString(),
            'views_count' => $this->views_count,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
            'images' => $this->whenLoaded('images'),
            'regions' => RegionResource::collection($this->whenLoaded('regions')),
        ];
    }
}


