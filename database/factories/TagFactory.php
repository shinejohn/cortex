<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tag>
 */
class TagFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->paragraph(),
            'article_count' => $this->faker->numberBetween(0, 100),
            'followers_count' => $this->faker->numberBetween(0, 100),
            'is_trending' => $this->faker->boolean(),
            'trending_score' => $this->faker->word(),
        ];
    }
}
