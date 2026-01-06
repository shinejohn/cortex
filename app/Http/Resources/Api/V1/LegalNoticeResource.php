<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class LegalNoticeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'workspace_id' => $this->workspace_id,
            'type' => $this->type,
            'case_number' => $this->case_number,
            'title' => $this->title,
            'content' => $this->content,
            'court' => $this->court,
            'publish_date' => $this->publish_date?->toISOString(),
            'expiry_date' => $this->expiry_date?->toISOString(),
            'status' => $this->status,
            'metadata' => $this->metadata,
            'views_count' => $this->views_count,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
            'regions' => RegionResource::collection($this->whenLoaded('regions')),
        ];
    }
}


