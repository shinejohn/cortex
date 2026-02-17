<?php

declare(strict_types=1);

namespace App\Http\Requests\EventCity;

use Illuminate\Foundation\Http\FormRequest;

final class StoreQrFlyerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'template' => ['required', 'string', 'in:default,modern,classic,neon'],
        ];
    }
}
