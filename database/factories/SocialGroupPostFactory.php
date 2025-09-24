<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SocialGroup;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialGroupPost>
 */
final class SocialGroupPostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'group_id' => SocialGroup::factory(),
            'user_id' => User::factory(),
            'content' => $this->faker->paragraphs(rand(1, 3), true),
            'media' => $this->faker->boolean(30) ? [
                $this->faker->imageUrl(640, 480, 'business'),
                $this->faker->optional(0.3)->imageUrl(640, 480, 'people'),
            ] : null,
            'is_pinned' => false,
            'is_active' => true,
        ];
    }

    public function pinned(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_pinned' => true,
        ]);
    }

    public function withMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media' => [
                $this->faker->imageUrl(640, 480, 'business'),
                $this->faker->imageUrl(640, 480, 'people'),
            ],
        ]);
    }
}
