<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class MemorialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'workspace_id' => $this->workspace_id,
            'name' => $this->name,
            'years' => $this->years,
            'date_of_passing' => $this->date_of_passing?->toISOString(),
            'obituary' => $this->obituary,
            'image' => $this->image,
            'location' => $this->location,
            'service_date' => $this->service_date?->toISOString(),
            'service_location' => $this->service_location,
            'service_details' => $this->service_details,
            'is_featured' => $this->is_featured,
            'status' => $this->status,
            'published_at' => $this->published_at?->toISOString(),
            'views_count' => $this->views_count,
            'reactions_count' => $this->reactions_count,
            'comments_count' => $this->comments_count,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
            'regions' => RegionResource::collection($this->whenLoaded('regions')),
        ];
    }
}


