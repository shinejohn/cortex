<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories.Factory<\App\Models\CommentReport>
 */
class CommentReportFactory extends Factory
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
            'reason' => $this->faker->sentence(),
            'details' => $this->faker->optional()->paragraph(),
            'status' => $this->faker->randomElement(['pending', 'reviewed', 'dismissed']),
        ];
    }
}
