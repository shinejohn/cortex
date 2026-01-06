<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class PhotoAlbumResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'workspace_id' => $this->workspace_id,
            'title' => $this->title,
            'description' => $this->description,
            'cover_image' => $this->cover_image,
            'visibility' => $this->visibility,
            'photos_count' => $this->photos_count,
            'views_count' => $this->views_count,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
            'photos' => PhotoResource::collection($this->whenLoaded('photos')),
        ];
    }
}


