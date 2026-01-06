<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreBusinessHoursRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'open_time' => ['required_without:is_closed', 'date_format:H:i'],
            'close_time' => ['required_without:is_closed', 'date_format:H:i'],
            'is_closed' => ['sometimes', 'boolean'],
            'is_24_hours' => ['sometimes', 'boolean'],
        ];
    }
}


