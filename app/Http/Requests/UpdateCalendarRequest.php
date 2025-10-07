<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateCalendarRequest extends FormRequest
{
    public function authorize(): bool
    {
        $calendar = $this->route('calendar');

        return $this->user() !== null && (
            $calendar->user_id === $this->user()->id ||
            $calendar->editors()->where('user_id', $this->user()->id)->exists()
        );
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:1000'],
            'category' => ['sometimes', 'string', 'in:jazz,kids,fitness,seniors,schools,sports,arts,food,professional'],
            'image' => ['nullable', 'file', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'about' => ['nullable', 'string', 'max:5000'],
            'location' => ['nullable', 'string', 'max:255'],
            'update_frequency' => ['sometimes', 'string', 'in:daily,weekly,bi-weekly,monthly'],
            'subscription_price' => ['sometimes', 'numeric', 'min:0', 'max:999.99'],
            'is_private' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'category.in' => 'Invalid calendar category selected.',
            'update_frequency.in' => 'Invalid update frequency selected.',
            'subscription_price.min' => 'Subscription price cannot be negative.',
            'subscription_price.max' => 'Subscription price cannot exceed $999.99.',
        ];
    }
}
