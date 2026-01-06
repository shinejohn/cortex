<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'excerpt' => $this->excerpt,
            'type' => $this->type,
            'category' => $this->category,
            'status' => $this->status,
            'featured_image' => $this->featured_image,
            'featured_image_path' => $this->featured_image_path,
            'view_count' => $this->view_count,
            'published_at' => $this->published_at?->toISOString(),
            'expires_at' => $this->expires_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'author' => new UserResource($this->whenLoaded('author')),
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
            'regions' => RegionResource::collection($this->whenLoaded('regions')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'comments_count' => $this->whenCounted('comments'),
        ];
    }
}


