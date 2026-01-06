<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StorePerformerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'workspace_id' => ['required', 'uuid', 'exists:workspaces,id'],
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['sometimes', 'nullable', 'string'],
            'genres' => ['sometimes', 'nullable', 'array'],
            'home_city' => ['sometimes', 'nullable', 'string'],
            'available_for_booking' => ['sometimes', 'boolean'],
        ];
    }
}


