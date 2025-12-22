<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreAuthorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'bio' => ['nullable', 'string', 'max:2000'],
            'author_slug' => [
                'nullable',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('users', 'author_slug')->ignore($userId),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'bio.max' => 'Bio cannot exceed 2,000 characters.',
            'author_slug.max' => 'Author slug cannot exceed 255 characters.',
            'author_slug.alpha_dash' => 'Author slug can only contain letters, numbers, dashes, and underscores.',
            'author_slug.unique' => 'This author slug is already taken.',
        ];
    }
}

