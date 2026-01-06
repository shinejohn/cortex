<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Crm;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BusinessReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'smb_business_id' => $this->smb_business_id,
            'author_name' => $this->author_name,
            'author_url' => $this->author_url,
            'language' => $this->language,
            'profile_photo_url' => $this->profile_photo_url,
            'rating' => $this->rating,
            'relative_time_description' => $this->relative_time_description,
            'text' => $this->text,
            'time' => $this->time?->toISOString(),
            'is_positive' => $this->isPositive(),
            'is_negative' => $this->isNegative(),
        ];
    }
}


