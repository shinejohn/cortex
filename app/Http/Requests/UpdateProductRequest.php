<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Rules\FreeIfWorkspaceNotApproved;
use Illuminate\Foundation\Http\FormRequest;

final class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $rules = [
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

        // Add workspace approval check for pricing if price is being updated
        if ($this->has('price')) {
            $product = $this->route('product');
            if ($product && $product->store && $product->store->workspace) {
                $rules['price'][] = new FreeIfWorkspaceNotApproved($product->store->workspace);
            }
        }

        return $rules;
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

    protected function prepareForValidation(): void
    {
        // Set default price to 0.00 if workspace cannot accept payments
        if ($this->has('price')) {
            $product = $this->route('product');
            if ($product && $product->store && $product->store->workspace) {
                $canAcceptPayments = $product->store->workspace->canAcceptPayments();

                if (! $canAcceptPayments) {
                    // Force to 0.00 if workspace cannot accept payments
                    $this->merge(['price' => '0.00']);
                }
            }
        }
    }
}
