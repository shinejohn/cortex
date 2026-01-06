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
        return [
            'user_id' => \App\Models\User::factory(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'category' => $this->faker->dateTime(),
            'image' => $this->faker->optional()->url(),
            'about' => $this->faker->word(),
            'location' => $this->faker->dateTime(),
            'update_frequency' => $this->faker->dateTime(),
            'subscription_price' => $this->faker->randomFloat(2, 0, 1000),
            'is_private' => $this->faker->dateTime(),
            'is_verified' => $this->faker->boolean(),
            'followers_count' => $this->faker->numberBetween(0, 100),
            'events_count' => $this->faker->numberBetween(0, 100),
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
