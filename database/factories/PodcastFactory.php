<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Podcast>
 */
class PodcastFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'creator_profile_id' => \App\Models\CreatorProfile::factory(),
            'title' => $this->faker->sentence(),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->paragraph(),
            'cover_image' => $this->faker->optional()->url(),
            'category' => $this->faker->optional()->word(),
            'status' => $this->faker->randomElement(['draft', 'published', 'archived']),
            'published_at' => $this->faker->optional()->dateTime(),
            'episodes_count' => 0,
            'subscribers_count' => 0,
            'total_listens' => 0,
            'total_duration' => 0,
        ];
    }
}
