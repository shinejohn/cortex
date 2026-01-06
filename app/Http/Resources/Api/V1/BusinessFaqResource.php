<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BusinessFaqResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_id' => $this->business_id,
            'question' => $this->question,
            'answer' => $this->answer,
            'category' => $this->category,
            'tags' => $this->tags,
            'variations' => $this->variations,
            'follow_up_questions' => $this->follow_up_questions,
            'times_used' => $this->times_used,
            'helpful_votes' => $this->helpful_votes,
            'unhelpful_votes' => $this->unhelpful_votes,
            'is_active' => $this->is_active,
            'display_order' => $this->display_order,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}


