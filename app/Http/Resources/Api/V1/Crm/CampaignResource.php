<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Crm;

use App\Http\Resources\Api\V1\TenantResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class CampaignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'name' => $this->name,
            'type' => $this->type,
            'status' => $this->status,
            'start_date' => $this->start_date?->toISOString(),
            'end_date' => $this->end_date?->toISOString(),
            'budget' => $this->budget,
            'spent' => $this->spent,
            'target_audience' => $this->target_audience,
            'content' => $this->content,
            'metadata' => $this->metadata,
            'is_active' => $this->isActive(),
            'is_completed' => $this->isCompleted(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
        ];
    }
}


