<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'workspace_id' => $this->workspace_id,
            'type' => $this->type,
            'title' => $this->title,
            'content' => $this->content,
            'image' => $this->image,
            'location' => $this->location,
            'event_date' => $this->event_date?->toISOString(),
            'status' => $this->status,
            'published_at' => $this->published_at?->toISOString(),
            'expires_at' => $this->expires_at?->toISOString(),
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


