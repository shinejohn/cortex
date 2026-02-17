<?php

declare(strict_types=1);

namespace App\Http\Requests\EventCity;

use Illuminate\Foundation\Http\FormRequest;

final class StoreAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'agency_name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'specialties' => ['nullable', 'array'],
            'specialties.*' => ['string'],
            'service_areas' => ['nullable', 'array'],
            'service_areas.*' => ['string'],
        ];
    }
}
