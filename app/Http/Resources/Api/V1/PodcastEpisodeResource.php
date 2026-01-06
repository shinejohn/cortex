<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class PodcastEpisodeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'podcast_id' => $this->podcast_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'show_notes' => $this->show_notes,
            'audio_file_path' => $this->audio_file_path,
            'audio_url' => $this->audio_url,
            'duration' => $this->duration,
            'file_size' => $this->file_size,
            'episode_number' => $this->episode_number,
            'status' => $this->status,
            'published_at' => $this->published_at?->toISOString(),
            'listens_count' => $this->listens_count,
            'downloads_count' => $this->downloads_count,
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'podcast' => new PodcastResource($this->whenLoaded('podcast')),
        ];
    }
}


