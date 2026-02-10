<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Business>
 */
final class BusinessFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $businessTypes = [
            'Restaurant',
            'Cafe',
            'Bar',
            'Hotel',
            'Retail Store',
            'Salon',
            'Gym',
            'Clinic',
            'Law Office',
            'Accounting Firm',
            'Real Estate Agency',
            'Auto Repair',
            'Bakery',
            'Bookstore',
            'Art Gallery',
            'Museum',
            'Theater',
            'Music Venue',
            'Event Space',
            'Co-working Space',
        ];

        $categories = [
            ['Food & Dining', 'Restaurant', 'American Cuisine'],
            ['Food & Dining', 'Cafe', 'Coffee Shop'],
            ['Nightlife', 'Bar', 'Cocktails'],
            ['Lodging', 'Hotel', 'Accommodation'],
            ['Shopping', 'Retail', 'Fashion'],
            ['Health & Beauty', 'Salon', 'Hair Care'],
            ['Fitness', 'Gym', 'Wellness'],
            ['Healthcare', 'Medical', 'Clinic'],
            ['Professional Services', 'Legal', 'Law Firm'],
            ['Professional Services', 'Financial', 'Accounting'],
        ];

        $name = fake()->company().' '.fake()->randomElement($businessTypes);
        $businessCategory = fake()->randomElement($categories);

        $images = [
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
            'https://images.unsplash.com/photo-1559339352-11d035aa65de',
            'https://images.unsplash.com/photo-1556740738-b6a63e27c4df',
        ];

        $openingHours = [
            'Monday' => ['open' => '09:00', 'close' => '18:00'],
            'Tuesday' => ['open' => '09:00', 'close' => '18:00'],
            'Wednesday' => ['open' => '09:00', 'close' => '18:00'],
            'Thursday' => ['open' => '09:00', 'close' => '18:00'],
            'Friday' => ['open' => '09:00', 'close' => '20:00'],
            'Saturday' => ['open' => '10:00', 'close' => '20:00'],
            'Sunday' => ['open' => '10:00', 'close' => '17:00'],
        ];

        $serpSource = fake()->randomElement(['local', 'maps', 'local_services']);
        $primaryType = fake()->randomElement($businessTypes);
        $verificationStatus = fake()->randomElement(['unverified', 'unverified', 'claimed', 'verified', 'google_guaranteed']);

        return [
            'workspace_id' => null,
            'google_place_id' => 'ChIJ'.Str::random(20),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(6),
            'description' => fake()->paragraph(3),
            'website' => fake()->boolean(80) ? fake()->url() : null,
            'phone' => fake()->phoneNumber(),
            'email' => fake()->boolean(60) ? fake()->companyEmail() : null,
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->stateAbbr(),
            'postal_code' => fake()->postcode(),
            'country' => 'USA',
            'latitude' => fake()->latitude(25.0, 45.0),
            'longitude' => fake()->longitude(-125.0, -70.0),
            'categories' => $businessCategory,
            'rating' => fake()->randomFloat(1, 3.0, 5.0),
            'reviews_count' => fake()->numberBetween(0, 500),
            'opening_hours' => $openingHours,
            'images' => fake()->randomElements($images, fake()->numberBetween(1, 3)),
            'serp_metadata' => [
                'scrape_date' => now()->toDateTimeString(),
                'source' => 'SERP API',
                'confidence_score' => fake()->randomFloat(2, 0.70, 1.0),
            ],
            // SERP API: Multiple identifiers
            'data_id' => fake()->boolean(70) ? '0x'.fake()->md5() : null,
            'data_cid' => fake()->boolean(70) ? fake()->numerify('####################') : null,
            'lsig' => fake()->boolean(50) ? 'AB86z5'.Str::random(30) : null,
            'provider_id' => fake()->boolean(40) ? 'provider_'.Str::random(15) : null,
            'local_services_cid' => $serpSource === 'local_services' ? fake()->numerify('####################') : null,
            'local_services_bid' => $serpSource === 'local_services' ? fake()->numerify('##########') : null,
            'local_services_pid' => $serpSource === 'local_services' ? 'g'.fake()->numerify('####################') : null,
            // SERP API: Source tracking
            'serp_source' => $serpSource,
            'serp_last_synced_at' => fake()->dateTimeBetween('-30 days', 'now'),
            // SERP API: Business type
            'primary_type' => $primaryType,
            'type_id' => 'type_'.Str::random(10),
            'type_ids' => fake()->randomElements(['restaurant', 'bar', 'cafe', 'food', 'dining'], fake()->numberBetween(1, 3)),
            // SERP API: Pricing and hours
            'price_level' => fake()->randomElement(['$', '$$', '$$$', '$$$$']),
            'open_state' => fake()->randomElement(['Open', 'Closed', 'Open 24 hours']),
            'hours_display' => 'Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-5PM',
            // SERP API: Local Services
            'google_badge' => $serpSource === 'local_services' && fake()->boolean(40) ? 'GOOGLE GUARANTEED' : null,
            'service_area' => $serpSource === 'local_services' ? fake()->randomElements([fake()->city(), fake()->city(), fake()->city()], fake()->numberBetween(1, 3)) : null,
            'years_in_business' => fake()->numberBetween(1, 50),
            'bookings_nearby' => $serpSource === 'local_services' ? fake()->numberBetween(0, 500) : null,
            // SERP API: Enhanced verification
            'verification_status' => $verificationStatus,
            'verified_at' => in_array($verificationStatus, ['verified', 'google_guaranteed']) ? fake()->dateTimeBetween('-2 years', '-1 month') : null,
            'claimed_at' => in_array($verificationStatus, ['claimed', 'verified', 'google_guaranteed']) ? fake()->dateTimeBetween('-3 years', '-2 months') : null,
            'is_verified' => in_array($verificationStatus, ['verified', 'google_guaranteed']),
            // SERP API: Service options and URLs
            'service_options' => [
                'dine_in' => fake()->boolean(70),
                'takeout' => fake()->boolean(80),
                'delivery' => fake()->boolean(50),
                'curbside_pickup' => fake()->boolean(40),
                'no_contact_delivery' => fake()->boolean(30),
            ],
            'reserve_url' => fake()->boolean(30) ? fake()->url() : null,
            'order_online_url' => fake()->boolean(40) ? fake()->url() : null,
            'status' => fake()->randomElement(['active', 'active', 'active', 'inactive']),
            'claimable_type' => null,
            'claimable_id' => null,
        ];
    }

    public function claimed(): static
    {
        return $this->state(fn (array $attributes) => [
            'workspace_id' => \App\Models\Workspace::factory(),
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
