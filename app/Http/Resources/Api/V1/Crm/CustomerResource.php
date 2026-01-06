<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Crm;

use App\Http\Resources\Api\V1\TenantResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'smb_business_id' => $this->smb_business_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'lifecycle_stage' => $this->lifecycle_stage,
            'lead_score' => $this->lead_score,
            'lead_source' => $this->lead_source,
            'email_opted_in' => $this->email_opted_in,
            'sms_opted_in' => $this->sms_opted_in,
            'lifetime_value' => $this->lifetime_value,
            'tags' => $this->tags,
            'custom_fields' => $this->custom_fields,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'smb_business' => new SmbBusinessResource($this->whenLoaded('smbBusiness')),
        ];
    }
}


