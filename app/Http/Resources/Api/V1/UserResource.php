<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'current_workspace_id' => $this->current_workspace_id,
            'tenant_id' => $this->tenant_id,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'workspaces' => WorkspaceResource::collection($this->whenLoaded('workspaces')),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
        ];
    }
}


