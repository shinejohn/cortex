<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;

final class StorePodcastRequest extends FormRequest
{
    public function authorize(): bool
    {
        $profile = \App\Models\CreatorProfile::where('user_id', $this->user()->id)
            ->approved()
            ->first();

        return $profile !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'category' => ['nullable', 'string', 'max:100'],
            'cover_image' => ['nullable', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'region_ids' => ['nullable', 'array'],
            'region_ids.*' => ['exists:regions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Podcast title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 5,000 characters.',
            'cover_image.max' => 'Cover image file size cannot exceed 5MB.',
            'region_ids.*.exists' => 'One or more selected regions are invalid.',
        ];
    }
}

