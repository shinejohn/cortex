<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['message', 'friend_request', 'like', 'comment', 'share', 'group_invite'];
        $type = fake()->randomElement($types);

        return [
            'user_id' => \App\Models\User::factory(),
            'type' => $type,
            'data' => [
                'meta' => fake()->words(3, true),
            ],
            'read' => fake()->boolean(30),
            'title' => fake()->sentence(3),
            'message' => fake()->sentence(),
            'action_url' => $this->getActionUrlForType($type),
        ];
    }

    private function getActionUrlForType(string $type): ?string
    {
        return match ($type) {
            'message' => '/messages',
            'friend_request' => '/friends/requests',
            'like', 'comment', 'share' => '/social/posts',
            'group_invite' => '/groups',
            default => null,
        };
    }
}
