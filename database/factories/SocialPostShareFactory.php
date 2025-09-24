<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SocialPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialPostShare>
 */
final class SocialPostShareFactory extends Factory
{
    public function definition(): array
    {
        return [
            'post_id' => SocialPost::factory(),
            'user_id' => User::factory(),
            'message' => $this->faker->optional(0.7)->sentence(),
        ];
    }

    public function withMessage(): static
    {
        return $this->state(fn (array $attributes) => [
            'message' => $this->faker->sentence(),
        ]);
    }
}
