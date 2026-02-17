<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class StoreDayNewsPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->current_workspace_id !== null;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(['article', 'announcement', 'notice', 'ad', 'schedule'])],
            'category' => [
                'nullable',
                'string',
                Rule::in([
                    'demise', 'missing_person', 'emergency',
                    'local_news', 'business', 'government', 'crime', 'sports',
                    'lifestyle', 'education', 'health', 'real_estate', 'opinion',
                ]),
            ],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'featured_image' => ['nullable', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'region_ids' => ['nullable', 'array'],
            'region_ids.*' => ['exists:regions,id'],
            'metadata' => ['nullable', 'array'],
            'metadata.ad_days' => ['required_if:type,ad', 'integer', 'min:1', 'max:90'],
            'metadata.ad_placement' => ['nullable', 'string', Rule::in(['sidebar', 'banner', 'inline', 'featured'])],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Post type is required.',
            'type.in' => 'Invalid post type selected.',
            'category.in' => 'Invalid category selected.',
            'title.required' => 'Title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'content.required' => 'Content is required.',
            'excerpt.max' => 'Excerpt cannot exceed 500 characters.',
            'featured_image.max' => 'Featured image file size cannot exceed 5MB.',
            'region_ids.*.exists' => 'One or more selected regions are invalid.',
            'metadata.ad_days.required_if' => 'Ad duration in days is required for advertisements.',
            'metadata.ad_days.min' => 'Ad duration must be at least 1 day.',
            'metadata.ad_days.max' => 'Ad duration cannot exceed 90 days.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->title ?? ''),
            'workspace_id' => $this->user()->current_workspace_id,
        ]);
    }
}
