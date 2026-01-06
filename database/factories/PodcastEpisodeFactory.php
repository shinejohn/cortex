<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PodcastEpisode>
 */
class PodcastEpisodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'podcast_id' => \App\Models\Podcast::factory(),
            'title' => $this->faker->sentence(),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->paragraph(),
            'show_notes' => $this->faker->optional()->paragraph(),
            'audio_file_path' => $this->faker->filePath(),
            'audio_file_disk' => 'public',
            'duration' => $this->faker->optional()->numberBetween(300, 3600),
            'file_size' => $this->faker->optional()->numberBetween(1000000, 50000000),
            'episode_number' => $this->faker->optional()->numerify('###'),
            'status' => $this->faker->randomElement(['draft', 'published', 'archived']),
            'published_at' => $this->faker->optional()->dateTime(),
            'listens_count' => 0,
            'downloads_count' => 0,
            'likes_count' => 0,
            'comments_count' => 0,
        ];
    }
}
