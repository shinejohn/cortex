<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class PodcastResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'creator_profile_id' => $this->creator_profile_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'cover_image' => $this->cover_image,
            'category' => $this->category,
            'status' => $this->status,
            'published_at' => $this->published_at?->toISOString(),
            'episodes_count' => $this->episodes_count,
            'subscribers_count' => $this->subscribers_count,
            'total_listens' => $this->total_listens,
            'total_duration' => $this->total_duration,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'creator' => new CreatorProfileResource($this->whenLoaded('creator')),
            'regions' => RegionResource::collection($this->whenLoaded('regions')),
        ];
    }
}


