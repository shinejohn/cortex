<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class TicketOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'subtotal' => $this->subtotal,
            'fees' => $this->fees,
            'discount' => $this->discount,
            'total' => $this->total,
            'promo_code' => $this->promo_code,
            'payment_status' => $this->payment_status,
            'completed_at' => $this->completed_at?->toISOString(),
            'is_free_order' => $this->is_free_order,
            'formatted_total' => $this->formatted_total,
            'total_quantity' => $this->total_quantity,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'items' => $this->whenLoaded('items'),
        ];
    }
}


