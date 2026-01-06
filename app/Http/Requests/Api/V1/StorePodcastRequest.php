<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StorePodcastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'creator_profile_id' => ['required', 'uuid', 'exists:creator_profiles,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'category' => ['sometimes', 'nullable', 'string'],
            'region_ids' => ['sometimes', 'array'],
            'region_ids.*' => ['uuid', 'exists:regions,id'],
        ];
    }
}


