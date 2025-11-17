<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RssFeed>
 */
final class RssFeedFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $feedTypes = ['blog', 'news', 'events', 'articles', 'podcast', 'video', 'other'];
        $statuses = ['active', 'active', 'active', 'inactive'];
        $healthStatuses = ['healthy', 'healthy', 'healthy', 'degraded', 'unhealthy'];

        return [
            'business_id' => Business::factory(),
            'url' => fake()->url().'/feed',
            'feed_type' => fake()->randomElement($feedTypes),
            'title' => fake()->sentence(3),
            'description' => fake()->sentence(10),
            'status' => fake()->randomElement($statuses),
            'health_status' => fake()->randomElement($healthStatuses),
            'last_checked_at' => fake()->boolean(70) ? fake()->dateTimeBetween('-1 week', 'now') : null,
            'last_successful_fetch_at' => fake()->boolean(80) ? fake()->dateTimeBetween('-1 week', 'now') : null,
            'last_error' => fake()->boolean(20) ? fake()->sentence() : null,
            'fetch_frequency' => fake()->randomElement([30, 60, 120, 240, 360]),
            'total_items_count' => fake()->numberBetween(0, 500),
            'metadata' => [
                'language' => fake()->randomElement(['en', 'en-US']),
                'encoding' => 'UTF-8',
                'generator' => fake()->randomElement(['WordPress', 'Ghost', 'Medium', 'Custom']),
            ],
            'auto_approved' => true,
        ];
    }

    public function healthy(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'health_status' => 'healthy',
            'last_error' => null,
            'last_successful_fetch_at' => now(),
        ]);
    }

    public function broken(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'broken',
            'health_status' => 'unhealthy',
            'last_error' => 'Failed to fetch feed: Connection timeout',
        ]);
    }

    public function degraded(): static
    {
        return $this->state(fn (array $attributes) => [
            'health_status' => 'degraded',
            'last_error' => 'Intermittent connection issues',
        ]);
    }
}
