<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'article_id' => ['required', 'uuid', 'exists:day_news_posts,id'],
            'parent_id' => ['sometimes', 'nullable', 'uuid', 'exists:article_comments,id'],
            'content' => ['required', 'string', 'max:5000'],
        ];
    }
}


