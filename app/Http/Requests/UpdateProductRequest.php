<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateProductRequest extends FormRequest
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
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0', 'gt:price'],
            'quantity' => ['sometimes', 'integer', 'min:0'],
            'track_inventory' => ['boolean'],
            'sku' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.max' => 'Product name cannot exceed 255 characters.',
            'price.min' => 'Price must be at least 0.',
            'compare_at_price.gt' => 'Compare at price must be greater than the regular price.',
            'images.max' => 'Maximum 5 images allowed.',
        ];
    }
}
