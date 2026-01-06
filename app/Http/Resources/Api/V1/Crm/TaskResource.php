<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Crm;

use App\Http\Resources\Api\V1\TenantResource;
use App\Http\Resources\Api\V1\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'customer_id' => $this->customer_id,
            'assigned_to_id' => $this->assigned_to_id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'priority' => $this->priority,
            'status' => $this->status,
            'due_date' => $this->due_date?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'metadata' => $this->metadata,
            'is_completed' => $this->isCompleted(),
            'is_overdue' => $this->isOverdue(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'assigned_to' => new UserResource($this->whenLoaded('assignedTo')),
        ];
    }
}


