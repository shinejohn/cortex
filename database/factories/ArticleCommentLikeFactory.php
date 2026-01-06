<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ArticleCommentLike>
 */
class ArticleCommentLikeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'comment_id' => \App\Models\ArticleComment::factory(),
            'user_id' => \App\Models\User::factory(),
        ];
    }
}
