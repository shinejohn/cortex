<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Venue>
 */
final class VenueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $venueTypes = [
            'Event Spaces',
            'Restaurants',
            'Hotels',
            'Outdoor Venues',
            'Theaters',
            'Museums',
            'Clubs',
            'Community Centers',
            'Churches',
            'Galleries',
        ];

        $amenities = [
            'Parking Available',
            'Wheelchair Accessible',
            'Kitchen/Catering',
            'A/V Equipment',
            'WiFi',
            'Bar Service',
            'Stage/Performance Area',
            'Air Conditioning',
            'Outdoor Space',
            'Security',
            'Sound System',
            'Professional Lighting',
            'Dressing Rooms',
        ];

        $eventTypes = [
            'Wedding',
            'Corporate',
            'Gala',
            'Conference',
            'Concert',
            'Birthday',
            'Graduation',
            'Fundraiser',
            'Workshop',
            'Exhibition',
        ];

        $images = [
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        ];

        $capacity = fake()->numberBetween(50, 1000);
        $pricePerHour = fake()->numberBetween(100, 2000);

        return [
            'name' => fake()->company().' '.fake()->randomElement(['Hall', 'Center', 'Ballroom', 'Gallery', 'Studio']),
            'description' => fake()->paragraph(3),
            'images' => fake()->randomElements($images, fake()->numberBetween(2, 4)),
            'verified' => fake()->boolean(70),
            'venue_type' => fake()->randomElement($venueTypes),
            'capacity' => $capacity,
            'price_per_hour' => $pricePerHour,
            'price_per_event' => $pricePerHour * fake()->numberBetween(6, 12),
            'price_per_day' => $pricePerHour * fake()->numberBetween(8, 16),
            'average_rating' => fake()->randomFloat(1, 3.5, 5.0),
            'total_reviews' => fake()->numberBetween(5, 200),
            'workspace_id' => Workspace::factory(),
            'created_by' => null, // Will be set in seeder
            'address' => fake()->streetAddress().', '.fake()->city().', '.fake()->stateAbbr().' '.fake()->postcode(),
            'neighborhood' => fake()->randomElement(['Downtown', 'Midtown', 'Historic District', 'Arts Quarter', 'Uptown', 'Waterfront']),
            'latitude' => fake()->latitude(25.0, 45.0),
            'longitude' => fake()->longitude(-125.0, -70.0),
            'amenities' => fake()->randomElements($amenities, fake()->numberBetween(3, 8)),
            'event_types' => fake()->randomElements($eventTypes, fake()->numberBetween(2, 6)),
            'unavailable_dates' => [],
            'last_booked_days_ago' => fake()->numberBetween(0, 30),
            'response_time_hours' => fake()->randomElement([1, 2, 4, 8, 24]),
            'listed_date' => fake()->dateTimeBetween('-2 years', 'now'),
            'status' => fake()->randomElement(['active', 'active', 'active', 'inactive']), // 75% active
        ];
    }
}
