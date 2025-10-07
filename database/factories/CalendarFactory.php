<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Calendar>
 */
final class CalendarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['jazz', 'kids', 'fitness', 'seniors', 'schools', 'sports', 'arts', 'food', 'professional'];
        $updateFrequencies = ['daily', 'weekly', 'bi-weekly', 'monthly'];
        $prices = [0, 0, 0, 2.99, 4.99, 9.99, 14.99];

        $category = fake()->randomElement($categories);

        // Generate category-specific titles
        $titles = [
            'jazz' => ['Jazz Nights', 'Smooth Jazz Calendar', 'Jazz Club Events', 'Live Jazz Sessions', 'Downtown Jazz'],
            'kids' => ['Family Fun Events', 'Kids Activities', 'Children\'s Calendar', 'Youth Programs', 'Fun for Kids'],
            'fitness' => ['Fitness Classes', 'Health & Wellness', 'Active Lifestyle', 'Workout Sessions', 'Gym Events'],
            'seniors' => ['Senior Activities', 'Golden Years Events', '55+ Community', 'Active Seniors', 'Senior Center'],
            'schools' => ['School Events', 'Educational Calendar', 'Campus Activities', 'Student Events', 'Academic Calendar'],
            'sports' => ['Sports Events', 'Athletic Calendar', 'Game Schedule', 'Sports & Recreation', 'Team Events'],
            'arts' => ['Arts & Culture', 'Creative Events', 'Gallery Openings', 'Performance Calendar', 'Art Scene'],
            'food' => ['Food Events', 'Culinary Calendar', 'Dining Experiences', 'Food Festivals', 'Chef\'s Table'],
            'professional' => ['Networking Events', 'Business Calendar', 'Professional Development', 'Career Events', 'Industry Meetups'],
        ];

        $title = fake()->randomElement($titles[$category] ?? ['Community Events']);

        return [
            'user_id' => \App\Models\User::factory(),
            'title' => $title,
            'description' => fake()->sentence(rand(8, 15)),
            'category' => $category,
            'image' => fake()->imageUrl(640, 480, 'events', true),
            'about' => fake()->paragraph(3),
            'location' => fake()->city().', '.fake()->stateAbbr(),
            'update_frequency' => fake()->randomElement($updateFrequencies),
            'subscription_price' => fake()->randomElement($prices),
            'is_private' => fake()->boolean(10),
            'is_verified' => fake()->boolean(30),
            'followers_count' => fake()->numberBetween(0, 5000),
            'events_count' => fake()->numberBetween(0, 50),
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
        ]);
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_private' => true,
        ]);
    }

    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_price' => 0,
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_price' => fake()->randomElement([2.99, 4.99, 9.99, 14.99]),
        ]);
    }

    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_private' => false,
        ]);
    }
}
