<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class CommunityThreadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'community_id' => $this->community_id,
            'title' => $this->title,
            'content' => $this->content,
            'type' => $this->type,
            'is_pinned' => $this->is_pinned,
            'is_locked' => $this->is_locked,
            'views_count' => $this->views_count,
            'reply_count' => $this->reply_count,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'author' => new UserResource($this->whenLoaded('author')),
            'replies' => $this->whenLoaded('replies'),
        ];
    }
}


