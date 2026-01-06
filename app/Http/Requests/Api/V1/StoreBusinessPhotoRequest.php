<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreBusinessPhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'photo_reference' => ['required', 'string'],
            'width' => ['sometimes', 'nullable', 'integer'],
            'height' => ['sometimes', 'nullable', 'integer'],
            'is_primary' => ['sometimes', 'boolean'],
        ];
    }
}


