<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Photo>
 */
class PhotoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'album_id' => $this->faker->optional()->randomElement([\App\Models\PhotoAlbum::factory(), null]),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->optional()->paragraph(),
            'image_path' => $this->faker->imageUrl(),
            'image_disk' => 'public',
            'thumbnail_path' => $this->faker->optional()->imageUrl(),
            'category' => $this->faker->optional()->randomElement(['Nature', 'Events', 'Recreation', 'Community', 'Sports']),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'width' => $this->faker->optional()->numberBetween(800, 1920),
            'height' => $this->faker->optional()->numberBetween(600, 1080),
            'file_size' => $this->faker->optional()->numberBetween(100000, 5000000),
            'views_count' => 0,
            'likes_count' => 0,
            'comments_count' => 0,
        ];
    }
}
