<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Performer>
 */
final class PerformerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $genres = [
            'Rock/Alternative',
            'Indie',
            'Pop/Top 40',
            'Jazz',
            'Classical',
            'Country',
            'Electronic',
            'Folk',
            'R&B',
            'Hip Hop',
            'Blues',
            'Reggae',
            'Latin',
            'World Music',
        ];

        $profileImages = [
            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        ];

        $cities = [
            'New York, NY',
            'Los Angeles, CA',
            'Chicago, IL',
            'Houston, TX',
            'Phoenix, AZ',
            'Philadelphia, PA',
            'San Antonio, TX',
            'San Diego, CA',
            'Dallas, TX',
            'San Jose, CA',
            'Austin, TX',
            'Jacksonville, FL',
            'Nashville, TN',
            'Atlanta, GA',
            'Miami, FL',
            'Seattle, WA',
        ];

        $bandNames = [
            'The Sunset Vibes',
            'Electric Dreams',
            'Midnight Echo',
            'Urban Legends',
            'Stellar Hearts',
            'Crimson Wave',
            'Golden Hour',
            'Silver Strings',
            'Neon Nights',
            'Vintage Soul',
            'Harmony Heights',
            'Rhythm Revolution',
            'The Blue Notes',
            'Cosmic Journey',
            'Velvet Thunder',
            'Phoenix Rising',
        ];

        $yearsActive = fake()->numberBetween(1, 15);
        $showsPlayed = $yearsActive * fake()->numberBetween(20, 80);
        $basePrice = fake()->numberBetween(500, 5000);

        return [
            'name' => fake()->randomElement($bandNames),
            'profile_image' => fake()->randomElement($profileImages),
            'genres' => fake()->randomElements($genres, fake()->numberBetween(1, 3)),
            'average_rating' => fake()->randomFloat(1, 3.8, 5.0),
            'total_reviews' => fake()->numberBetween(5, 150),
            'workspace_id' => null, // Will be set in seeder
            'created_by' => null, // Will be set in seeder
            'follower_count' => fake()->numberBetween(100, 50000),
            'bio' => fake()->paragraph(2),
            'years_active' => $yearsActive,
            'shows_played' => $showsPlayed,
            'home_city' => fake()->randomElement($cities),
            'is_verified' => fake()->boolean(30),
            'is_touring_now' => fake()->boolean(40),
            'available_for_booking' => fake()->boolean(85),
            'has_merchandise' => fake()->boolean(60),
            'has_original_music' => fake()->boolean(80),
            'offers_meet_and_greet' => fake()->boolean(45),
            'takes_requests' => fake()->boolean(70),
            'available_for_private_events' => fake()->boolean(90),
            'is_family_friendly' => fake()->boolean(75),
            'has_samples' => fake()->boolean(85),
            'trending_score' => fake()->numberBetween(40, 100),
            'distance_miles' => fake()->randomFloat(1, 0.5, 50.0),
            'added_date' => fake()->dateTimeBetween('-3 years', 'now'),
            'introductory_pricing' => fake()->boolean(20),
            'base_price' => $basePrice,
            'currency' => 'USD',
            'minimum_booking_hours' => fake()->randomElement([1, 2, 3, 4]),
            'travel_fee_per_mile' => fake()->randomFloat(2, 0.50, 2.00),
            'setup_fee' => fake()->numberBetween(50, 300),
            'cancellation_policy' => fake()->randomElement([
                '24 hours notice required',
                '48 hours notice required',
                '72 hours notice required',
                'Non-refundable',
            ]),
            'status' => fake()->randomElement(['active', 'active', 'active', 'inactive']), // 75% active
        ];
    }
}
