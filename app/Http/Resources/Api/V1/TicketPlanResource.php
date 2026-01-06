<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class TicketPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'max_quantity' => $this->max_quantity,
            'available_quantity' => $this->available_quantity,
            'is_active' => $this->is_active,
            'is_free' => $this->is_free,
            'formatted_price' => $this->formatted_price,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'event' => new EventResource($this->whenLoaded('event')),
        ];
    }
}


