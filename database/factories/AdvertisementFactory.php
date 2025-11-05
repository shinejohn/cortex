<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Advertisement>
 */
final class AdvertisementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'platform' => 'day_news',
            'placement' => $this->faker->randomElement(['sidebar', 'banner', 'inline', 'featured']),
            'advertable_type' => \App\Models\DayNewsPost::class,
            'advertable_id' => \App\Models\DayNewsPost::factory(),
            'is_active' => true,
            'starts_at' => now()->subDays(7),
            'expires_at' => now()->addDays($this->faker->numberBetween(7, 30)),
            'impressions_count' => $this->faker->numberBetween(0, 10000),
            'clicks_count' => $this->faker->numberBetween(0, 500),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
            'expires_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }
}
