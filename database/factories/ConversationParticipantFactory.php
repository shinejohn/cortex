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
            'conversation_id' => \App\Models\Conversation::factory(),
            'user_id' => \App\Models\User::factory(),
            'joined_at' => $this->faker->dateTime(),
            'last_read_at' => $this->faker->dateTime(),
            'is_admin' => $this->faker->boolean(),
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
