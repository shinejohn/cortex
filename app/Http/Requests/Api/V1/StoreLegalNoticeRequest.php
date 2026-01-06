<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreLegalNoticeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'workspace_id' => ['required', 'uuid', 'exists:workspaces,id'],
            'type' => ['required', 'string'],
            'case_number' => ['sometimes', 'nullable', 'string'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'court' => ['sometimes', 'nullable', 'string'],
            'publish_date' => ['required', 'date'],
            'expiry_date' => ['sometimes', 'nullable', 'date'],
            'region_ids' => ['sometimes', 'array'],
            'region_ids.*' => ['uuid', 'exists:regions,id'],
        ];
    }
}


