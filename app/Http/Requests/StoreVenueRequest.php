<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Rules\FreeIfWorkspaceNotApproved;
use Illuminate\Foundation\Http\FormRequest;

final class StoreVenueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $workspace = $this->user()?->currentWorkspace;

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'images' => ['sometimes', 'array', 'max:10'],
            'images.*' => ['file', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'venue_type' => ['required', 'string', 'max:100'],
            'capacity' => ['required', 'integer', 'min:1'],
            'price_per_hour' => ['nullable', 'numeric', 'min:0'],
            'price_per_event' => ['nullable', 'numeric', 'min:0'],
            'price_per_day' => ['nullable', 'numeric', 'min:0'],
            'address' => ['required', 'string', 'max:500'],
            'neighborhood' => ['nullable', 'string', 'max:100'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'google_place_id' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', 'max:100'],
            'event_types' => ['nullable', 'array'],
            'event_types.*' => ['string', 'max:100'],
            'unavailable_dates' => ['nullable', 'array'],
            'unavailable_dates.*' => ['date'],
        ];

        // Add workspace approval check for pricing
        if ($workspace) {
            $rules['price_per_hour'][] = new FreeIfWorkspaceNotApproved($workspace);
            $rules['price_per_event'][] = new FreeIfWorkspaceNotApproved($workspace);
            $rules['price_per_day'][] = new FreeIfWorkspaceNotApproved($workspace);
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Venue name is required.',
            'description.required' => 'Venue description is required.',
            'venue_type.required' => 'Venue type is required.',
            'capacity.required' => 'Venue capacity is required.',
            'capacity.min' => 'Capacity must be at least 1.',
            'address.required' => 'Venue address is required.',
            'latitude.required' => 'Latitude is required.',
            'longitude.required' => 'Longitude is required.',
            'latitude.between' => 'Invalid latitude value.',
            'longitude.between' => 'Invalid longitude value.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Parse JSON strings to arrays for amenities and event_types
        if ($this->has('amenities') && is_string($this->amenities)) {
            $this->merge([
                'amenities' => json_decode($this->amenities, true) ?? [],
            ]);
        }

        if ($this->has('event_types') && is_string($this->event_types)) {
            $this->merge([
                'event_types' => json_decode($this->event_types, true) ?? [],
            ]);
        }

        // Set default price values to 0.00 if not provided or empty
        $workspace = $this->user()?->currentWorkspace;
        $canAcceptPayments = $workspace && $workspace->canAcceptPayments();

        $priceFields = ['price_per_hour', 'price_per_event', 'price_per_day'];
        $priceMerge = [];

        foreach ($priceFields as $field) {
            if (! $canAcceptPayments) {
                // Force to 0.00 if workspace cannot accept payments
                $priceMerge[$field] = '0.00';
            } elseif (! $this->filled($field)) {
                // Default to 0.00 if not provided
                $priceMerge[$field] = '0.00';
            }
        }

        if (! empty($priceMerge)) {
            $this->merge($priceMerge);
        }
    }
}
