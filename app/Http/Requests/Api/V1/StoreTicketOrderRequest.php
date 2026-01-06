<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreTicketOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_id' => ['required', 'uuid', 'exists:events,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ticket_plan_id' => ['required', 'uuid', 'exists:ticket_plans,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'promo_code' => ['sometimes', 'nullable', 'string'],
        ];
    }
}


