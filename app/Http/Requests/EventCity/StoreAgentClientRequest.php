<?php

declare(strict_types=1);

namespace App\Http\Requests\EventCity;

use Illuminate\Foundation\Http\FormRequest;

final class StoreAgentClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'client_type' => ['required', 'string', 'in:performer,venue_owner'],
            'permissions' => ['nullable', 'array'],
        ];
    }
}
