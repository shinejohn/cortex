<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class EmailCampaignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'community_id' => $this->community_id,
            'name' => $this->name,
            'type' => $this->type,
            'status' => $this->status,
            'subject' => $this->subject,
            'scheduled_at' => $this->scheduled_at?->toISOString(),
            'total_recipients' => $this->total_recipients,
            'sent_count' => $this->sent_count,
            'opened_count' => $this->opened_count,
            'clicked_count' => $this->clicked_count,
            'open_rate' => $this->open_rate,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}


