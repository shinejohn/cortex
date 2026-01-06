<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Crm;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BusinessAttributeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'smb_business_id' => $this->smb_business_id,
            'attribute_key' => $this->attribute_key,
            'attribute_value' => $this->attribute_value,
            'attribute_type' => $this->attribute_type,
        ];
    }
}


