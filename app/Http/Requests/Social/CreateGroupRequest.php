<?php

declare(strict_types=1);

namespace App\Http\Requests\Social;

use Illuminate\Foundation\Http\FormRequest;

final class CreateGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'privacy' => ['required', 'in:public,private,secret'],
            'cover_image' => ['nullable', 'string', 'url'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Group name is required.',
            'name.max' => 'Group name cannot exceed 100 characters.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'privacy.required' => 'Group privacy setting is required.',
            'privacy.in' => 'Invalid privacy option.',
        ];
    }
}
