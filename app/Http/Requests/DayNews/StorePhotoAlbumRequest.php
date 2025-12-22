<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StorePhotoAlbumRequest extends FormRequest
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
            'visibility' => ['required', 'string', Rule::in(['public', 'private', 'community'])],
            'cover_image_id' => ['nullable', 'uuid', 'exists:photos,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Album title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'visibility.required' => 'Please select album visibility.',
            'visibility.in' => 'Invalid visibility option selected.',
            'cover_image_id.exists' => 'Selected cover image does not exist.',
        ];
    }
}

