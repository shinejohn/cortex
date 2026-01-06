<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PhotoAlbum>
 */
class PhotoAlbumFactory extends Factory
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
            'workspace_id' => $this->faker->optional()->randomElement([\App\Models\Workspace::factory(), null]),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->optional()->paragraph(),
            'cover_image' => $this->faker->optional()->imageUrl(),
            'visibility' => $this->faker->randomElement(['public', 'private', 'community']),
            'photos_count' => 0,
            'views_count' => 0,
        ];
    }
}
