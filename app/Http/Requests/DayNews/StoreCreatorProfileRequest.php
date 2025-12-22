<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;

final class StoreCreatorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'display_name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'avatar' => ['nullable', 'image', 'max:2048', 'mimes:jpeg,jpg,png,gif,webp'],
            'cover_image' => ['nullable', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'social_links' => ['nullable', 'array'],
            'social_links.twitter' => ['nullable', 'url', 'max:255'],
            'social_links.instagram' => ['nullable', 'url', 'max:255'],
            'social_links.facebook' => ['nullable', 'url', 'max:255'],
            'social_links.youtube' => ['nullable', 'url', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'display_name.required' => 'Display name is required.',
            'display_name.max' => 'Display name cannot exceed 255 characters.',
            'bio.max' => 'Bio cannot exceed 2,000 characters.',
            'avatar.max' => 'Avatar file size cannot exceed 2MB.',
            'cover_image.max' => 'Cover image file size cannot exceed 5MB.',
            'social_links.*.url' => 'Social media links must be valid URLs.',
        ];
    }
}

