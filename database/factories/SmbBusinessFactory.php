<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SmbBusiness>
 */
class SmbBusinessFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $googlePlaceId = 'ChIJ' . $this->faker->unique()->regexify('[A-Za-z0-9]{27}');
        $displayName = $this->faker->company();
        
        return [
            'id' => Str::uuid(),
            'google_place_id' => $googlePlaceId,
            'tenant_id' => Tenant::factory(),
            'display_name' => $displayName,
            
            // Location - REQUIRED
            'latitude' => $this->faker->latitude(25, 31),  // Florida range
            'longitude' => $this->faker->longitude(-88, -80),
            'formatted_address' => $this->faker->address(),
            'address_components' => [],
            'plus_code' => $this->faker->optional()->regexify('[A-Z0-9]{4}\+[A-Z0-9]{2}'),
            'viewport' => [],
            'location' => [],
            
            // Contact - REQUIRED
            'phone_national' => $this->faker->phoneNumber(),
            'phone_international' => '+1 ' . $this->faker->numerify('###-###-####'),
            'website_url' => $this->faker->optional()->url(),
            'business_status' => 'OPERATIONAL',
            'fibonacco_status' => $this->faker->randomElement(['prospect', 'active', 'churned']),
            
            // Ratings
            'google_rating' => $this->faker->randomFloat(1, 1, 5),
            'google_rating_count' => $this->faker->numberBetween(0, 500),
            'user_rating_total' => $this->faker->numberBetween(0, 1000),
            
            // Service flags - ALL booleans
            'delivery' => $this->faker->boolean(),
            'dine_in' => $this->faker->boolean(),
            'takeout' => $this->faker->boolean(),
            'reservable' => $this->faker->boolean(),
            'outdoor_seating' => $this->faker->boolean(),
            'serves_breakfast' => $this->faker->boolean(),
            'serves_lunch' => $this->faker->boolean(),
            'serves_dinner' => $this->faker->boolean(),
            'serves_beer' => $this->faker->boolean(),
            'serves_wine' => $this->faker->boolean(),
            'serves_brunch' => $this->faker->boolean(),
            'serves_vegetarian_food' => $this->faker->boolean(),
            'wheelchair_accessible_entrance' => $this->faker->boolean(),
            
            // JSON fields
            'place_types' => ['restaurant', 'food', 'establishment'],
            'accessibility_options' => [],
            'payment_options' => [],
            'parking_options' => [],
            'data_sources' => ['google'],
            'opening_hours' => [],
            'current_opening_hours' => [],
            'secondary_opening_hours' => [],
            'editorial_summary' => [],
            'photos' => [],
            'reviews' => [],
            'utc_offset' => $this->faker->numberBetween(-5, -4) * 60,
            'adr_address' => $this->faker->optional()->address(),
            'formatted_phone_number' => $this->faker->optional()->phoneNumber(),
            'international_phone_number' => $this->faker->optional()->regexify('\+1[0-9]{10}'),
            'price_level' => $this->faker->optional()->numberBetween(0, 4),
            'icon' => $this->faker->optional()->url(),
            'icon_background_color' => $this->faker->optional()->hexColor(),
            'icon_mask_base_uri' => $this->faker->optional()->url(),
            'name' => $displayName,
            'place_id' => $googlePlaceId,
            'reference' => $this->faker->optional()->regexify('[A-Za-z0-9]{27}'),
            'scope' => $this->faker->optional()->randomElement(['GOOGLE']),
            'types' => ['restaurant', 'food', 'establishment', 'point_of_interest'],
            'url' => $this->faker->optional()->url(),
            'vicinity' => $this->faker->optional()->address(),
            'geometry' => [],
            'permanently_closed' => false,
            'permanently_closed_time' => null,
            
            // Timestamps
            'last_google_sync_at' => $this->faker->optional()->dateTimeThisMonth(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the business is operational.
     */
    public function operational(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_status' => 'OPERATIONAL',
        ]);
    }

    /**
     * Indicate that the business is closed permanently.
     */
    public function closedPermanently(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_status' => 'CLOSED_PERMANENTLY',
            'permanently_closed' => true,
        ]);
    }

    /**
     * Indicate that the business is active in Fibonacco.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'fibonacco_status' => 'active',
        ]);
    }

    /**
     * Indicate that the business is a prospect.
     */
    public function prospect(): static
    {
        return $this->state(fn (array $attributes) => [
            'fibonacco_status' => 'prospect',
        ]);
    }
}
