<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreBusinessSurveyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'survey_type' => ['required', 'string'],
            'questions' => ['required', 'array'],
            'trigger_type' => ['sometimes', 'nullable', 'string'],
        ];
    }
}


