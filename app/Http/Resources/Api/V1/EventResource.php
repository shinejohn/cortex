<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'event_date' => $this->event_date?->toISOString(),
            'time' => $this->time,
            'category' => $this->category,
            'subcategories' => $this->subcategories,
            'badges' => $this->badges,
            'is_free' => $this->is_free,
            'price_min' => $this->price_min,
            'price_max' => $this->price_max,
            'status' => $this->status,
            'image' => $this->image,
            'image_path' => $this->image_path,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'postal_code' => $this->postal_code,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'venue' => new VenueResource($this->whenLoaded('venue')),
            'performer' => new PerformerResource($this->whenLoaded('performer')),
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
            'regions' => RegionResource::collection($this->whenLoaded('regions')),
        ];
    }
}


