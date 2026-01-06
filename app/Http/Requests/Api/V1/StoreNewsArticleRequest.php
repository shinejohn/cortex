<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreNewsArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'region_id' => ['required', 'uuid', 'exists:regions,id'],
            'title' => ['required', 'string', 'max:255'],
            'url' => ['required', 'string', 'url'],
            'content_snippet' => ['sometimes', 'nullable', 'string'],
            'full_content' => ['sometimes', 'nullable', 'string'],
            'source_type' => ['sometimes', 'nullable', 'string'],
            'source_name' => ['sometimes', 'nullable', 'string'],
            'published_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}


