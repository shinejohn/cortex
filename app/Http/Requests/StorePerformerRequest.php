<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Rules\FreeIfWorkspaceNotApproved;
use Illuminate\Foundation\Http\FormRequest;

final class StorePerformerRequest extends FormRequest
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
            'images' => ['sometimes', 'array', 'max:10'],
            'images.*' => ['file', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'],
            'genres' => ['required', 'array', 'min:1'],
            'genres.*' => ['string', 'max:100'],
            'bio' => ['required', 'string', 'max:2000'],
            'years_active' => ['nullable', 'integer', 'min:0'],
            'shows_played' => ['nullable', 'integer', 'min:0'],
            'home_city' => ['nullable', 'string', 'max:100'],
            'available_for_booking' => ['boolean'],
            'has_merchandise' => ['boolean'],
            'has_original_music' => ['boolean'],
            'offers_meet_and_greet' => ['boolean'],
            'takes_requests' => ['boolean'],
            'available_for_private_events' => ['boolean'],
            'is_family_friendly' => ['boolean'],
            'has_samples' => ['boolean'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:3'],
            'minimum_booking_hours' => ['nullable', 'integer', 'min:1'],
            'travel_fee_per_mile' => ['nullable', 'numeric', 'min:0'],
            'setup_fee' => ['nullable', 'numeric', 'min:0'],
            'cancellation_policy' => ['nullable', 'string', 'max:1000'],
        ];

        // Add workspace approval check for pricing
        if ($workspace) {
            $rules['base_price'][] = new FreeIfWorkspaceNotApproved($workspace);
            $rules['travel_fee_per_mile'][] = new FreeIfWorkspaceNotApproved($workspace);
            $rules['setup_fee'][] = new FreeIfWorkspaceNotApproved($workspace);
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Performer name is required.',
            'genres.required' => 'At least one genre is required.',
            'genres.min' => 'At least one genre must be selected.',
            'bio.required' => 'Bio is required.',
            'bio.max' => 'Bio cannot exceed 2000 characters.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Parse JSON strings to arrays for genres
        if ($this->has('genres') && is_string($this->genres)) {
            $this->merge([
                'genres' => json_decode($this->genres, true) ?? [],
            ]);
        }

        // Set default price values to 0.00 if not provided or empty
        $workspace = $this->user()?->currentWorkspace;
        $canAcceptPayments = $workspace && $workspace->canAcceptPayments();

        $priceFields = ['base_price', 'travel_fee_per_mile', 'setup_fee'];
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
