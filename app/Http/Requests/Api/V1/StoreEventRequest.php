<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreEventRequest extends FormRequest
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
            'description' => ['sometimes', 'nullable', 'string'],
            'event_date' => ['required', 'date'],
            'time' => ['sometimes', 'nullable', 'string'],
            'category' => ['sometimes', 'nullable', 'string'],
            'venue_id' => ['sometimes', 'nullable', 'uuid', 'exists:venues,id'],
            'performer_id' => ['sometimes', 'nullable', 'uuid', 'exists:performers,id'],
            'is_free' => ['sometimes', 'boolean'],
            'price_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'price_max' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'region_ids' => ['sometimes', 'array'],
            'region_ids.*' => ['uuid', 'exists:regions,id'],
        ];
    }
}


