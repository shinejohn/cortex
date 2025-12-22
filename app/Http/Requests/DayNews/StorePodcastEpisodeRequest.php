<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;

final class StorePodcastEpisodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $podcast = $this->route('podcast');
        
        if (!$podcast instanceof \App\Models\Podcast) {
            return false;
        }

        return $podcast->creator->user_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'show_notes' => ['nullable', 'string', 'max:10000'],
            'audio_file' => ['required', 'file', 'mimes:mp3,wav,m4a', 'max:102400'], // 100MB max
            'episode_number' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Episode title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 5,000 characters.',
            'show_notes.max' => 'Show notes cannot exceed 10,000 characters.',
            'audio_file.required' => 'Please select an audio file to upload.',
            'audio_file.mimes' => 'Audio file must be MP3, WAV, or M4A format.',
            'audio_file.max' => 'Audio file size cannot exceed 100MB.',
        ];
    }
}

