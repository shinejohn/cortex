<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Achievement>
 */
class AchievementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'business_id' => \App\Models\Business::factory(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'source_name' => $this->faker->company(),
            'source_url' => $this->faker->url(),
            'achievement_type' => $this->faker->randomElement(['award', 'certification', 'recognition', 'milestone']),
            'achievement_date' => $this->faker->date(),
            'expiration_date' => $this->faker->optional()->date(),
            'icon' => $this->faker->optional()->word(),
            'badge_image_url' => $this->faker->optional()->imageUrl(),
            'is_verified' => $this->faker->boolean(70),
            'display_order' => $this->faker->numberBetween(0, 100),
            'is_featured' => $this->faker->boolean(30),
        ];
    }
}
