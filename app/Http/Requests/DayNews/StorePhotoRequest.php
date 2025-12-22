<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StorePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['required', 'image', 'max:10240', 'mimes:jpeg,jpg,png,gif,webp'],
            'category' => ['nullable', 'string', Rule::in(['Nature', 'Events', 'Recreation', 'Community', 'Sports', 'Environment', 'Other'])],
            'album_id' => ['nullable', 'uuid', 'exists:photo_albums,id'],
            'region_ids' => ['nullable', 'array'],
            'region_ids.*' => ['exists:regions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Photo title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'image.required' => 'Please select an image to upload.',
            'image.image' => 'The file must be an image.',
            'image.max' => 'Image file size cannot exceed 10MB.',
            'image.mimes' => 'Image must be a JPEG, PNG, GIF, or WebP file.',
            'album_id.exists' => 'Selected album does not exist.',
            'region_ids.*.exists' => 'One or more selected regions are invalid.',
        ];
    }
}

