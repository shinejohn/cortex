<?php

declare(strict_types=1);

namespace App\Http\Requests\DayNews;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        $announcement = $this->route('announcement');
        return $this->user() !== null && $this->user()->id === $announcement->user_id;
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'required', 'string', Rule::in([
                'wedding',
                'engagement',
                'birth',
                'graduation',
                'anniversary',
                'celebration',
                'general',
                'community_event',
                'public_notice',
                'emergency_alert',
                'meeting',
                'volunteer_opportunity',
                'road_closure',
                'school_announcement',
            ])],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'location' => ['nullable', 'string', 'max:255'],
            'event_date' => ['nullable', 'date'],
            'region_ids' => ['nullable', 'array'],
            'region_ids.*' => ['exists:regions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Announcement type is required.',
            'type.in' => 'Invalid announcement type selected.',
            'title.required' => 'Title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'content.required' => 'Content is required.',
            'content.max' => 'Content cannot exceed 5,000 characters.',
            'image.image' => 'The file must be an image.',
            'image.max' => 'Image file size cannot exceed 5MB.',
            'image.mimes' => 'Image must be a JPEG, PNG, GIF, or WebP file.',
            'location.max' => 'Location cannot exceed 255 characters.',
            'event_date.date' => 'Event date must be a valid date.',
            'region_ids.*.exists' => 'One or more selected regions are invalid.',
        ];
    }
}

