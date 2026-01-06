<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Crm;

use App\Http\Resources\Api\V1\TenantResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class DealResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'customer_id' => $this->customer_id,
            'name' => $this->name,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'stage' => $this->stage,
            'probability' => $this->probability,
            'expected_close_date' => $this->expected_close_date?->toISOString(),
            'actual_close_date' => $this->actual_close_date?->toISOString(),
            'description' => $this->description,
            'tags' => $this->tags,
            'custom_fields' => $this->custom_fields,
            'is_won' => $this->isWon(),
            'is_lost' => $this->isLost(),
            'is_open' => $this->isOpen(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'customer' => new CustomerResource($this->whenLoaded('customer')),
        ];
    }
}


