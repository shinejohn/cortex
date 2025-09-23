<?php

declare(strict_types=1);

namespace App\Http\Requests\Social;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'bio' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'url', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'profile_visibility' => ['required', 'in:public,friends,private'],
            'interests' => ['nullable', 'array', 'max:10'],
            'interests.*' => ['string', 'max:50'],
            'cover_photo' => ['nullable', 'string', 'url'],
            'social_links' => ['nullable', 'array'],
            'social_links.*' => ['url'],
            'show_email' => ['required', 'boolean'],
            'show_location' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'bio.max' => 'Bio cannot exceed 500 characters.',
            'website.url' => 'Please enter a valid website URL.',
            'birth_date.before' => 'Birth date must be in the past.',
            'profile_visibility.required' => 'Profile visibility is required.',
            'profile_visibility.in' => 'Invalid profile visibility option.',
            'interests.max' => 'You can have a maximum of 10 interests.',
            'interests.*.max' => 'Each interest cannot exceed 50 characters.',
        ];
    }
}
