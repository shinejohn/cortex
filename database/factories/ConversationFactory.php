<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conversation>
 */
final class ConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(['private', 'group']),
            'title' => fake()->optional(0.3)->words(3, true),
            'metadata' => fake()->optional(0.2)->randomElements([
                'description' => fake()->sentence(),
                'settings' => fake()->randomElements(['notifications' => true, 'read_receipts' => true]),
            ]),
            'last_message_at' => fake()->optional(0.8)->dateTimeBetween('-30 days', 'now'),
        ];
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'private',
            'title' => null,
        ]);
    }

    public function group(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'group',
            'title' => fake()->words(3, true),
        ]);
    }
}
