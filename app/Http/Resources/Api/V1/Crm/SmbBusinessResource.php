<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Crm;

use App\Http\Resources\Api\V1\TenantResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class SmbBusinessResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'google_place_id' => $this->google_place_id,
            'display_name' => $this->display_name,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'formatted_address' => $this->formatted_address,
            'phone_national' => $this->phone_national,
            'phone_international' => $this->phone_international,
            'website_url' => $this->website_url,
            'business_status' => $this->business_status,
            'fibonacco_status' => $this->fibonacco_status,
            'google_rating' => $this->google_rating,
            'google_rating_count' => $this->google_rating_count,
            'place_types' => $this->place_types,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
        ];
    }
}


