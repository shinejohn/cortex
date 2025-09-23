<?php

declare(strict_types=1);

namespace App\Http\Requests\Social;

use Illuminate\Foundation\Http\FormRequest;

final class CreatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:5000'],
            'media' => ['nullable', 'array', 'max:4'],
            'media.*' => ['string', 'url'],
            'visibility' => ['required', 'in:public,friends,private'],
            'location' => ['nullable', 'array'],
            'location.name' => ['required_with:location', 'string', 'max:255'],
            'location.lat' => ['required_with:location', 'numeric', 'between:-90,90'],
            'location.lng' => ['required_with:location', 'numeric', 'between:-180,180'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Post content is required.',
            'content.max' => 'Post content cannot exceed 5000 characters.',
            'media.max' => 'You can upload a maximum of 4 media files.',
            'visibility.required' => 'Please select post visibility.',
            'visibility.in' => 'Invalid visibility option.',
        ];
    }
}
