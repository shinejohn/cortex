<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Crm;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BusinessPhotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'smb_business_id' => $this->smb_business_id,
            'photo_reference' => $this->photo_reference,
            'width' => $this->width,
            'height' => $this->height,
            'html_attributions' => $this->html_attributions,
            'is_primary' => $this->is_primary,
            'display_order' => $this->display_order,
        ];
    }
}


