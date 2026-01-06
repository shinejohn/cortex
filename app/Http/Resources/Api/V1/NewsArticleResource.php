<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class NewsArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'region_id' => $this->region_id,
            'business_id' => $this->business_id,
            'source_type' => $this->source_type,
            'source_name' => $this->source_name,
            'title' => $this->title,
            'url' => $this->url,
            'content_snippet' => $this->content_snippet,
            'full_content' => $this->full_content,
            'source_publisher' => $this->source_publisher,
            'published_at' => $this->published_at?->toISOString(),
            'metadata' => $this->metadata,
            'processed' => $this->processed,
            'relevance_score' => $this->relevance_score,
            'relevance_topic_tags' => $this->relevance_topic_tags,
            'relevance_rationale' => $this->relevance_rationale,
            'scored_at' => $this->scored_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'region' => new RegionResource($this->whenLoaded('region')),
            'business' => $this->whenLoaded('business'),
        ];
    }
}


