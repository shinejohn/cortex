<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Crm;

use App\Http\Resources\Api\V1\TenantResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class InteractionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'customer_id' => $this->customer_id,
            'type' => $this->type,
            'subject' => $this->subject,
            'description' => $this->description,
            'direction' => $this->direction,
            'duration_minutes' => $this->duration_minutes,
            'outcome' => $this->outcome,
            'next_action' => $this->next_action,
            'next_action_date' => $this->next_action_date?->toISOString(),
            'metadata' => $this->metadata,
            'is_inbound' => $this->isInbound(),
            'is_outbound' => $this->isOutbound(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'customer' => new CustomerResource($this->whenLoaded('customer')),
        ];
    }
}


