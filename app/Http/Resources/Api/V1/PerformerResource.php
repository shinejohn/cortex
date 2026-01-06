<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class PerformerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'profile_image' => $this->profile_image,
            'genres' => $this->genres,
            'rating' => $this->rating,
            'review_count' => $this->review_count,
            'follower_count' => $this->follower_count,
            'bio' => $this->bio,
            'years_active' => $this->years_active,
            'shows_played' => $this->shows_played,
            'home_city' => $this->home_city,
            'is_verified' => $this->is_verified,
            'is_touring_now' => $this->is_touring_now,
            'available_for_booking' => $this->available_for_booking,
            'trending_score' => $this->trending_score,
            'base_price' => $this->base_price,
            'currency' => $this->currency,
            'status' => $this->status,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}


