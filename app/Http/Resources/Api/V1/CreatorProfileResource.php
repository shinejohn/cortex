<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class CreatorProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'display_name' => $this->display_name,
            'slug' => $this->slug,
            'bio' => $this->bio,
            'avatar' => $this->avatar,
            'cover_image' => $this->cover_image,
            'social_links' => $this->social_links,
            'status' => $this->status,
            'followers_count' => $this->followers_count,
            'podcasts_count' => $this->podcasts_count,
            'episodes_count' => $this->episodes_count,
            'total_listens' => $this->total_listens,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'podcasts' => PodcastResource::collection($this->whenLoaded('podcasts')),
        ];
    }
}


