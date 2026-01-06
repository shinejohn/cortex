<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'business_id' => $this->business_id,
            'title' => $this->title,
            'description' => $this->description,
            'discount_type' => $this->discount_type,
            'discount_value' => $this->discount_value,
            'terms' => $this->terms,
            'code' => $this->code,
            'image' => $this->image,
            'business_name' => $this->business_name,
            'business_location' => $this->business_location,
            'start_date' => $this->start_date?->toISOString(),
            'end_date' => $this->end_date?->toISOString(),
            'usage_limit' => $this->usage_limit,
            'used_count' => $this->used_count,
            'status' => $this->status,
            'views_count' => $this->views_count,
            'clicks_count' => $this->clicks_count,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'business' => $this->whenLoaded('business'),
            'regions' => RegionResource::collection($this->whenLoaded('regions')),
        ];
    }
}


