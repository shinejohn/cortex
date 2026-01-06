<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AlphaSiteCommunity>
 */
class AlphaSiteCommunityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'city' => $this->faker->word(),
            'state' => $this->faker->dateTime(),
            'country' => $this->faker->numberBetween(0, 100),
            'slug' => $this->faker->slug(),
            'name' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'hero_image_url' => $this->faker->optional()->url(),
            'logo_url' => $this->faker->optional()->url(),
            'total_businesses' => $this->faker->word(),
            'premium_businesses' => $this->faker->word(),
            'total_categories' => $this->faker->dateTime(),
            'seo_title' => $this->faker->sentence(),
            'seo_description' => $this->faker->paragraph(),
            'featured_categories' => $this->faker->dateTime(),
            'is_active' => $this->faker->boolean(),
            'launched_at' => $this->faker->dateTime(),
        ];
    }
}
