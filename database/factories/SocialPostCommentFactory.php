<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SocialPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialPostComment>
 */
final class SocialPostCommentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'post_id' => SocialPost::factory(),
            'user_id' => User::factory(),
            'parent_id' => null,
            'content' => $this->faker->paragraph(),
            'is_active' => true,
        ];
    }

    public function reply(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => fn () => self::factory()->create()->id,
        ]);
    }
}
