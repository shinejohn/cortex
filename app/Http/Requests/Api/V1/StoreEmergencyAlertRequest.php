<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreEmergencyAlertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'community_id' => ['required', 'uuid', 'exists:communities,id'],
            'priority' => ['required', 'string', 'in:low,medium,high,critical'],
            'category' => ['required', 'string'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'instructions' => ['sometimes', 'nullable', 'string'],
            'expires_at' => ['sometimes', 'nullable', 'date', 'after:now'],
        ];
    }
}


