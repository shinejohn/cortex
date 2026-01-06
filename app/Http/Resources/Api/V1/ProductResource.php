<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_id' => $this->store_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'images' => $this->images,
            'price' => $this->price,
            'compare_at_price' => $this->compare_at_price,
            'quantity' => $this->quantity,
            'track_inventory' => $this->track_inventory,
            'sku' => $this->sku,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'is_in_stock' => $this->isInStock(),
            'has_discount' => $this->hasDiscount(),
            'discount_percentage' => $this->discount_percentage,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'store' => new StoreResource($this->whenLoaded('store')),
        ];
    }
}


