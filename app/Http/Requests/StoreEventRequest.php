<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'images' => ['sometimes', 'array', 'max:5'],
            'images.*' => ['file', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'event_date' => ['required', 'date', 'after:now'],
            'time' => ['required', 'date_format:H:i'],
            'description' => ['required', 'string', 'max:5000'],
            'category' => ['required', 'string', 'max:100'],
            'subcategories' => ['nullable', 'array'],
            'subcategories.*' => ['string', 'max:100'],
            'badges' => ['nullable', 'array'],
            'badges.*' => ['string', 'max:50'],
            'is_free' => ['boolean'],
            'price_min' => ['required_if:is_free,false', 'nullable', 'numeric', 'min:0'],
            'price_max' => ['required_if:is_free,false', 'nullable', 'numeric', 'min:0', 'gte:price_min'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'venue_id' => ['nullable', 'exists:venues,id'],
            'performer_id' => ['nullable', 'exists:performers,id'],
            'new_venue' => ['nullable', 'array'],
            'new_venue.name' => ['required_with:new_venue', 'string', 'max:255'],
            'new_venue.description' => ['required_with:new_venue', 'string', 'max:2000'],
            'new_venue.venue_type' => ['required_with:new_venue', 'string', 'max:100'],
            'new_venue.capacity' => ['required_with:new_venue', 'integer', 'min:1'],
            'new_venue.address' => ['required_with:new_venue', 'string', 'max:500'],
            'new_performer' => ['nullable', 'array'],
            'new_performer.name' => ['required_with:new_performer', 'string', 'max:255'],
            'new_performer.bio' => ['required_with:new_performer', 'string', 'max:2000'],
            'new_performer.genres' => ['required_with:new_performer', 'array', 'min:1'],
            'curator_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Event title is required.',
            'event_date.required' => 'Event date is required.',
            'event_date.after' => 'Event date must be in the future.',
            'time.required' => 'Event time is required.',
            'description.required' => 'Event description is required.',
            'category.required' => 'Event category is required.',
            'price_min.required_if' => 'Minimum price is required for paid events.',
            'price_max.gte' => 'Maximum price must be greater than or equal to minimum price.',
            'venue_id.exists' => 'Selected venue does not exist.',
            'performer_id.exists' => 'Selected performer does not exist.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Parse JSON strings to arrays
        if ($this->has('subcategories') && is_string($this->subcategories)) {
            $this->merge([
                'subcategories' => json_decode($this->subcategories, true) ?? [],
            ]);
        }

        if ($this->has('badges') && is_string($this->badges)) {
            $this->merge([
                'badges' => json_decode($this->badges, true) ?? [],
            ]);
        }

        if ($this->has('new_venue') && is_string($this->new_venue)) {
            $this->merge([
                'new_venue' => json_decode($this->new_venue, true),
            ]);
        }

        if ($this->has('new_performer') && is_string($this->new_performer)) {
            $this->merge([
                'new_performer' => json_decode($this->new_performer, true),
            ]);
        }
    }
}
