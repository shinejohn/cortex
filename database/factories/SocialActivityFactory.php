<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialActivity>
 */
final class SocialActivityFactory extends Factory
{
    public function definition(): array
    {
        $types = [
            'post_like', 'post_comment', 'post_share',
            'friend_request', 'friend_accept',
            'group_invite', 'group_join', 'group_post',
            'profile_follow',
        ];

        $type = $this->faker->randomElement($types);

        return [
            'user_id' => User::factory(),
            'actor_id' => User::factory(),
            'type' => $type,
            'subject_type' => $this->getSubjectTypeForActivityType($type),
            'subject_id' => Str::uuid(),
            'data' => $this->getDataForActivityType($type),
            'is_read' => $this->faker->boolean(30),
        ];
    }

    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => false,
        ]);
    }

    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
        ]);
    }

    public function postLike(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'post_like',
            'subject_type' => 'App\\Models\\SocialPost',
            'data' => null,
        ]);
    }

    public function friendRequest(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'friend_request',
            'subject_type' => 'App\\Models\\SocialFriendship',
            'data' => null,
        ]);
    }

    private function getSubjectTypeForActivityType(string $type): string
    {
        return match ($type) {
            'post_like', 'post_comment', 'post_share' => 'App\\Models\\SocialPost',
            'friend_request', 'friend_accept' => 'App\\Models\\SocialFriendship',
            'group_invite', 'group_join', 'group_post' => 'App\\Models\\SocialGroup',
            'profile_follow' => 'App\\Models\\User',
            default => 'App\\Models\\SocialPost',
        };
    }

    private function getDataForActivityType(string $type): ?array
    {
        return match ($type) {
            'post_comment' => ['comment_text' => $this->faker->sentence()],
            'post_share' => ['share_message' => $this->faker->optional()->sentence()],
            'group_invite' => ['invitation_message' => $this->faker->optional()->sentence()],
            default => null,
        };
    }
}
