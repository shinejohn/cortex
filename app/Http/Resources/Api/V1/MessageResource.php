<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'content' => $this->content,
            'type' => $this->type,
            'metadata' => $this->metadata,
            'edited_at' => $this->edited_at?->toISOString(),
            'is_edited' => $this->isEdited(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'sender' => new UserResource($this->whenLoaded('sender')),
        ];
    }
}


