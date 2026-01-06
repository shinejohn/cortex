<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateNewsArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'content_snippet' => ['sometimes', 'nullable', 'string'],
            'full_content' => ['sometimes', 'nullable', 'string'],
            'processed' => ['sometimes', 'boolean'],
        ];
    }
}


