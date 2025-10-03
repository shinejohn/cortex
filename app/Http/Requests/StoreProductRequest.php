<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

final class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'store_id' => ['required', 'exists:stores,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0', 'gt:price'],
            'quantity' => ['required', 'integer', 'min:0'],
            'track_inventory' => ['boolean'],
            'sku' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'store_id.required' => 'Store is required.',
            'store_id.exists' => 'Selected store does not exist.',
            'name.required' => 'Product name is required.',
            'price.required' => 'Product price is required.',
            'price.min' => 'Price must be at least 0.',
            'compare_at_price.gt' => 'Compare at price must be greater than the regular price.',
            'quantity.required' => 'Quantity is required.',
            'images.max' => 'Maximum 5 images allowed.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->name ?? ''),
        ]);
    }
}
