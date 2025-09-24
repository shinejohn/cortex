<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialFriendship>
 */
final class SocialFriendshipFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'friend_id' => User::factory(),
            'status' => $this->faker->randomElement(['pending', 'accepted', 'blocked']),
            'requested_at' => now(),
            'responded_at' => fn (array $attributes) => $attributes['status'] !== 'pending'
                ? $this->faker->dateTimeBetween($attributes['requested_at'], 'now')
                : null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'responded_at' => null,
        ]);
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'accepted',
            'responded_at' => $this->faker->dateTimeBetween($attributes['requested_at'] ?? now()->subDays(7), 'now'),
        ]);
    }

    public function blocked(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'blocked',
            'responded_at' => $this->faker->dateTimeBetween($attributes['requested_at'] ?? now()->subDays(7), 'now'),
        ]);
    }
}
