<?php

declare(strict_types=1);

namespace App\Http\Requests\Social;

use Illuminate\Foundation\Http\FormRequest;

final class CreateCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:2000'],
            'parent_id' => ['nullable', 'string', 'exists:social_post_comments,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Comment content is required.',
            'content.max' => 'Comment cannot exceed 2000 characters.',
            'parent_id.exists' => 'The parent comment does not exist.',
        ];
    }
}
