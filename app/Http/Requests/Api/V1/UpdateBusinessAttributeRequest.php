<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateBusinessAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attribute_key' => ['required', 'string'],
            'attribute_value' => ['required'],
            'attribute_type' => ['required', 'string', 'in:string,integer,boolean,array'],
        ];
    }
}


