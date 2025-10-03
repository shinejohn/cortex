<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

final class StoreStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'logo' => ['nullable', 'image', 'max:2048', 'mimes:jpeg,jpg,png,gif,webp'],
            'banner' => ['nullable', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'slug' => ['sometimes', 'string'],
            'workspace_id' => ['sometimes', 'exists:workspaces,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Store name is required.',
            'name.max' => 'Store name cannot exceed 255 characters.',
            'logo.max' => 'Logo file size cannot exceed 2MB.',
            'banner.max' => 'Banner file size cannot exceed 5MB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->name ?? ''),
            'workspace_id' => $this->user()->current_workspace_id,
        ]);
    }
}
