<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialGroup>
 */
final class SocialGroupFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(rand(2, 4), true),
            'description' => $this->faker->optional(0.8)->paragraphs(rand(1, 3), true),
            'cover_image' => $this->faker->optional(0.5)->imageUrl(800, 300, 'business'),
            'creator_id' => User::factory(),
            'privacy' => $this->faker->randomElement(['public', 'private', 'secret']),
            'is_active' => true,
            'settings' => $this->faker->optional(0.3)->passthrough([
                'allow_member_posts' => $this->faker->boolean(80),
                'require_approval' => $this->faker->boolean(30),
                'auto_approve_posts' => $this->faker->boolean(70),
            ]),
        ];
    }

    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'privacy' => 'public',
        ]);
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'privacy' => 'private',
        ]);
    }

    public function secret(): static
    {
        return $this->state(fn (array $attributes) => [
            'privacy' => 'secret',
        ]);
    }
}
