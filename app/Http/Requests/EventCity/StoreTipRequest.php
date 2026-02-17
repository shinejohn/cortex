<?php

declare(strict_types=1);

namespace App\Http\Requests\EventCity;

use Illuminate\Foundation\Http\FormRequest;

final class StoreTipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'performer_id' => ['required', 'exists:performers,id'],
            'amount_cents' => ['required', 'integer', 'min:100', 'max:100000'],
            'fan_name' => ['required', 'string', 'max:255'],
            'fan_email' => ['required', 'email', 'max:255'],
            'fan_phone' => ['nullable', 'string', 'max:20'],
            'fan_message' => ['nullable', 'string', 'max:500'],
            'is_anonymous' => ['boolean'],
            'payment_intent_id' => ['required', 'string'],
            'event_id' => ['nullable', 'exists:events,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount_cents.min' => 'The minimum tip amount is $1.00.',
            'amount_cents.max' => 'The maximum tip amount is $1,000.00.',
            'fan_name.required' => 'Please enter your name.',
            'fan_email.required' => 'Please enter your email address.',
        ];
    }
}
