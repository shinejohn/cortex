<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ArticleComment>
 */
class ArticleCommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'article_id' => \App\Models\DayNewsPost::factory(),
            'user_id' => \App\Models\User::factory(),
            'parent_id' => null,
            'content' => $this->faker->paragraph(),
            'is_active' => $this->faker->boolean(),
            'is_pinned' => $this->faker->boolean(),
            'reports_count' => $this->faker->numberBetween(0, 100),
        ];
    }
}
