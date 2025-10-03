<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'logo' => ['nullable', 'file', 'image', 'max:2048', 'mimes:jpeg,jpg,png,gif,webp'],
            'banner' => ['nullable', 'file', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.max' => 'Store name cannot exceed 255 characters.',
            'logo.max' => 'Logo file size cannot exceed 2MB.',
            'banner.max' => 'Banner file size cannot exceed 5MB.',
        ];
    }
}
