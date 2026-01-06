<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BusinessSubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_id' => $this->business_id,
            'tier' => $this->tier,
            'status' => $this->status,
            'trial_started_at' => $this->trial_started_at?->toISOString(),
            'trial_expires_at' => $this->trial_expires_at?->toISOString(),
            'trial_converted_at' => $this->trial_converted_at?->toISOString(),
            'subscription_started_at' => $this->subscription_started_at?->toISOString(),
            'subscription_expires_at' => $this->subscription_expires_at?->toISOString(),
            'auto_renew' => $this->auto_renew,
            'monthly_amount' => $this->monthly_amount,
            'billing_cycle' => $this->billing_cycle,
            'ai_services_enabled' => $this->ai_services_enabled,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}


