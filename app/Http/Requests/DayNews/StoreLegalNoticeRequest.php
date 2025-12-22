<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreLegalNoticeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(['foreclosure', 'probate', 'name_change', 'business_formation', 'public_hearing', 'zoning', 'tax_sale', 'other'])],
            'case_number' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:10000'],
            'court' => ['nullable', 'string', 'max:255'],
            'publish_date' => ['required', 'date'],
            'expiry_date' => ['nullable', 'date', 'after:publish_date'],
            'region_ids' => ['nullable', 'array'],
            'region_ids.*' => ['exists:regions,id'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Notice type is required.',
            'type.in' => 'Invalid notice type selected.',
            'title.required' => 'Notice title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'content.required' => 'Notice content is required.',
            'content.max' => 'Content cannot exceed 10,000 characters.',
            'publish_date.required' => 'Publish date is required.',
            'publish_date.date' => 'Publish date must be a valid date.',
            'expiry_date.date' => 'Expiry date must be a valid date.',
            'expiry_date.after' => 'Expiry date must be after publish date.',
            'region_ids.*.exists' => 'One or more selected regions are invalid.',
        ];
    }
}

