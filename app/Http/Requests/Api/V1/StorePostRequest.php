<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'workspace_id' => ['required', 'uuid', 'exists:workspaces,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'excerpt' => ['sometimes', 'nullable', 'string', 'max:500'],
            'type' => ['sometimes', 'string'],
            'category' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'string', 'in:draft,published,scheduled'],
            'featured_image' => ['sometimes', 'nullable', 'string'],
            'region_ids' => ['sometimes', 'array'],
            'region_ids.*' => ['uuid', 'exists:regions,id'],
            'tag_ids' => ['sometimes', 'array'],
            'tag_ids.*' => ['uuid', 'exists:tags,id'],
        ];
    }
}


