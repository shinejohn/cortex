<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreSocialPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:5000'],
            'media' => ['sometimes', 'nullable', 'array'],
            'visibility' => ['sometimes', 'string', 'in:public,friends,private'],
        ];
    }
}


