<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StorePodcastEpisodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'podcast_id' => ['required', 'uuid', 'exists:podcasts,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'show_notes' => ['sometimes', 'nullable', 'string'],
            'audio_file_path' => ['required', 'string'],
            'duration' => ['sometimes', 'nullable', 'integer'],
            'episode_number' => ['sometimes', 'nullable', 'integer'],
        ];
    }
}


