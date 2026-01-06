<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreSocialAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provider' => ['required', 'string', 'in:google,facebook,apple,twitter'],
            'provider_id' => ['required', 'string'],
            'name' => ['sometimes', 'nullable', 'string'],
            'token' => ['sometimes', 'nullable', 'string'],
            'refresh_token' => ['sometimes', 'nullable', 'string'],
            'avatar' => ['sometimes', 'nullable', 'string', 'url'],
            'expires_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}


