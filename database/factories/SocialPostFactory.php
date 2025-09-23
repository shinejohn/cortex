<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialPost>
 */
final class SocialPostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'content' => $this->faker->paragraphs(rand(1, 3), true),
            'visibility' => $this->faker->randomElement(['public', 'friends', 'private']),
            'media' => $this->faker->boolean(30) ? [
                $this->faker->imageUrl(640, 480, 'people'),
                $this->faker->optional(0.3)->imageUrl(640, 480, 'nature'),
            ] : null,
            'location' => $this->faker->optional(0.2)->passthrough([
                'name' => $this->faker->city(),
                'lat' => $this->faker->latitude(),
                'lng' => $this->faker->longitude(),
            ]),
            'is_active' => true,
        ];
    }

    public function withMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media' => [
                $this->faker->imageUrl(640, 480, 'people'),
                $this->faker->imageUrl(640, 480, 'nature'),
            ],
        ]);
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'visibility' => 'private',
        ]);
    }

    public function friendsOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'visibility' => 'friends',
        ]);
    }
}
