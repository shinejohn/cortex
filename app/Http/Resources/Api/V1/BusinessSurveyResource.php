<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BusinessSurveyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_id' => $this->business_id,
            'name' => $this->name,
            'description' => $this->description,
            'survey_type' => $this->survey_type,
            'questions' => $this->questions,
            'trigger_type' => $this->trigger_type,
            'trigger_config' => $this->trigger_config,
            'is_active' => $this->is_active,
            'responses_count' => $this->responses_count,
            'average_score' => $this->average_score,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}


