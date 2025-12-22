<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;

final class StoreMemorialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'years' => ['required', 'string', 'max:50'],
            'date_of_passing' => ['required', 'date'],
            'obituary' => ['required', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'location' => ['nullable', 'string', 'max:255'],
            'service_date' => ['nullable', 'date'],
            'service_location' => ['nullable', 'string', 'max:255'],
            'service_details' => ['nullable', 'string', 'max:2000'],
            'region_ids' => ['nullable', 'array'],
            'region_ids.*' => ['exists:regions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'name.max' => 'Name cannot exceed 255 characters.',
            'years.required' => 'Years are required (e.g., "1932 - 2023").',
            'years.max' => 'Years cannot exceed 50 characters.',
            'date_of_passing.required' => 'Date of passing is required.',
            'date_of_passing.date' => 'Date of passing must be a valid date.',
            'obituary.required' => 'Obituary is required.',
            'obituary.max' => 'Obituary cannot exceed 5,000 characters.',
            'image.max' => 'Image file size cannot exceed 5MB.',
            'image.mimes' => 'Image must be a JPEG, PNG, GIF, or WebP file.',
            'service_date.date' => 'Service date must be a valid date.',
            'region_ids.*.exists' => 'One or more selected regions are invalid.',
        ];
    }
}

