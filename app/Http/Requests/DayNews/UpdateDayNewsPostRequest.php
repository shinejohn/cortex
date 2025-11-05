<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use App\Models\DayNewsPost;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateDayNewsPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        $post = $this->route('post');

        if (! $post instanceof DayNewsPost) {
            return false;
        }

        return $this->user() !== null
            && $this->user()->current_workspace_id === $post->workspace_id
            && $post->status === 'draft';
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'string', Rule::in(['article', 'announcement', 'notice', 'ad', 'schedule'])],
            'category' => ['nullable', 'string', Rule::in(['demise', 'missing_person', 'emergency'])],
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
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
            'type.in' => 'Invalid post type selected.',
            'category.in' => 'Invalid category selected.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'excerpt.max' => 'Excerpt cannot exceed 500 characters.',
            'featured_image.max' => 'Featured image file size cannot exceed 5MB.',
            'region_ids.*.exists' => 'One or more selected regions are invalid.',
            'metadata.ad_days.required_if' => 'Ad duration in days is required for advertisements.',
            'metadata.ad_days.min' => 'Ad duration must be at least 1 day.',
            'metadata.ad_days.max' => 'Ad duration cannot exceed 90 days.',
        ];
    }
}
