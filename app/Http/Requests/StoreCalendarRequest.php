<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StoreCalendarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
            'category' => ['required', 'string', 'in:jazz,kids,fitness,seniors,schools,sports,arts,food,professional'],
            'image' => ['nullable', 'file', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'about' => ['nullable', 'string', 'max:5000'],
            'location' => ['nullable', 'string', 'max:255'],
            'update_frequency' => ['required', 'string', 'in:daily,weekly,bi-weekly,monthly'],
            'subscription_price' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'is_private' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Calendar title is required.',
            'description.required' => 'Calendar description is required.',
            'category.required' => 'Calendar category is required.',
            'category.in' => 'Invalid calendar category selected.',
            'update_frequency.required' => 'Update frequency is required.',
            'update_frequency.in' => 'Invalid update frequency selected.',
            'subscription_price.required' => 'Subscription price is required.',
            'subscription_price.min' => 'Subscription price cannot be negative.',
            'subscription_price.max' => 'Subscription price cannot exceed $999.99.',
        ];
    }
}
