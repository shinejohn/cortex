<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class HubResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workspace_id' => $this->workspace_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image,
            'category' => $this->category,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'is_verified' => $this->is_verified,
            'followers_count' => $this->followers_count,
            'events_count' => $this->events_count,
            'articles_count' => $this->articles_count,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
        ];
    }
}


