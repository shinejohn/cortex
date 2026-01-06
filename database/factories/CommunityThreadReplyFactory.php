<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CommunityThread;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CommunityThreadReply>
 */
final class CommunityThreadReplyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
                                public function definition(): array
    {
        return [
            'thread_id' => \App\Models\CommunityThread::factory(),
            'user_id' => \App\Models\User::factory(),
            'content' => $this->faker->paragraph(),
            'images' => $this->faker->optional()->url(),
            'is_solution' => $this->faker->boolean(),
            'is_pinned' => $this->faker->boolean(),
            'is_edited' => $this->faker->boolean(),
            'edited_at' => $this->faker->dateTime(),
            'reply_to_id' => null,
        ];
    }

    /**
     * Indicate that the reply is a solution (for question threads).
     */
    public function solution(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_solution' => true,
        ]);
    }

    /**
     * Indicate that the reply is pinned.
     */
    public function pinned(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_pinned' => true,
        ]);
    }

    /**
     * Indicate that the reply has been edited.
     */
    public function edited(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_edited' => true,
            'edited_at' => fake()->dateTimeBetween($attributes['created_at'] ?? '-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the reply has images.
     */
    public function withImages(): static
    {
        return $this->state(fn (array $attributes) => [
            'images' => [
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            ],
        ]);
    }

    /**
     * Indicate that the reply is a nested reply to another reply.
     */
    public function nestedReply(): static
    {
        return $this->state(fn (array $attributes) => [
            'reply_to_id' => \App\Models\CommunityThreadReply::factory(),
        ]);
    }
}
