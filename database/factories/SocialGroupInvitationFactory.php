<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SocialGroup;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialGroupInvitation>
 */
final class SocialGroupInvitationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'group_id' => SocialGroup::factory(),
            'inviter_id' => User::factory(),
            'invited_id' => User::factory(),
            'message' => $this->faker->optional(0.6)->sentence(),
            'status' => $this->faker->randomElement(['pending', 'accepted', 'declined']),
            'expires_at' => $this->faker->optional(0.8)->dateTimeBetween('now', '+30 days'),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'accepted',
        ]);
    }

    public function declined(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'declined',
        ]);
    }

    public function withMessage(): static
    {
        return $this->state(fn (array $attributes) => [
            'message' => $this->faker->sentence(),
        ]);
    }

    public function withExpiration(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => $this->faker->dateTimeBetween('now', '+30 days'),
        ]);
    }
}
