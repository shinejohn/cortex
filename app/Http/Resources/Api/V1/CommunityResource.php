<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class CommunityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'image' => $this->image,
            'categories' => $this->categories,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'member_count' => $this->member_count,
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
            'created_by' => new UserResource($this->whenLoaded('createdBy')),
        ];
    }
}


