<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Crm;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BusinessHoursResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'smb_business_id' => $this->smb_business_id,
            'day_of_week' => $this->day_of_week,
            'day_name' => $this->day_name,
            'open_time' => $this->open_time?->format('H:i'),
            'close_time' => $this->close_time?->format('H:i'),
            'is_closed' => $this->is_closed,
            'is_24_hours' => $this->is_24_hours,
        ];
    }
}


