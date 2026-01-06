<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class SocialPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'content' => $this->content,
            'media' => $this->media,
            'visibility' => $this->visibility,
            'location' => $this->location,
            'is_active' => $this->is_active,
            'likes_count' => $this->likesCount(),
            'comments_count' => $this->commentsCount(),
            'shares_count' => $this->sharesCount(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}


