<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CreatorProfile>
 */
class CreatorProfileFactory extends Factory
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
            'display_name' => $this->faker->name(),
            'slug' => $this->faker->unique()->slug(),
            'bio' => $this->faker->optional()->paragraph(),
            'avatar' => $this->faker->optional()->imageUrl(),
            'cover_image' => $this->faker->optional()->imageUrl(),
            'social_links' => [],
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected', 'suspended']),
            'followers_count' => 0,
            'podcasts_count' => 0,
            'episodes_count' => 0,
            'total_listens' => 0,
        ];
    }
}
