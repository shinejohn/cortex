<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SocialGroup;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialGroupMember>
 */
final class SocialGroupMemberFactory extends Factory
{
    public function definition(): array
    {
        return [
            'group_id' => SocialGroup::factory(),
            'user_id' => User::factory(),
            'role' => $this->faker->randomElement(['admin', 'moderator', 'member']),
            'status' => $this->faker->randomElement(['pending', 'approved', 'banned']),
            'joined_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
            'status' => 'approved',
        ]);
    }

    public function moderator(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'moderator',
            'status' => 'approved',
        ]);
    }

    public function member(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'member',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }

    public function banned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'banned',
        ]);
    }
}
