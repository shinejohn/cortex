<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ConversationParticipant>
 */
final class ConversationParticipantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'joined_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'last_read_at' => fake()->optional(0.7)->dateTimeBetween('-7 days', 'now'),
            'is_admin' => fake()->boolean(20), // 20% chance of being admin
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_admin' => true,
        ]);
    }

    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_read_at' => null,
        ]);
    }
}
