<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class VenueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'images' => $this->images,
            'verified' => $this->verified,
            'venue_type' => $this->venue_type,
            'capacity' => $this->capacity,
            'price_per_hour' => $this->price_per_hour,
            'price_per_event' => $this->price_per_event,
            'price_per_day' => $this->price_per_day,
            'rating' => $this->rating,
            'review_count' => $this->review_count,
            'address' => $this->address,
            'neighborhood' => $this->neighborhood,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'postal_code' => $this->postal_code,
            'amenities' => $this->amenities,
            'event_types' => $this->event_types,
            'status' => $this->status,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'location' => $this->location,
        ];
    }
}


