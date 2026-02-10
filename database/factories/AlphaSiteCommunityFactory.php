<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AlphaSiteCommunity>
 */
final class AlphaSiteCommunityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'city' => $this->faker->city(),
            'state' => $this->faker->stateAbbr(),
            'country' => 'US',
            'slug' => $this->faker->unique()->slug(),
            'name' => $this->faker->city().' Community',
            'description' => $this->faker->sentence(),
            'hero_image_url' => $this->faker->imageUrl(),
            'logo_url' => $this->faker->imageUrl(100, 100),
            'total_businesses' => $this->faker->numberBetween(0, 1000),
            'premium_businesses' => $this->faker->numberBetween(0, 100),
            'total_categories' => $this->faker->numberBetween(5, 50),
            'seo_title' => $this->faker->sentence(),
            'seo_description' => $this->faker->sentence(),
            'featured_categories' => json_encode($this->faker->words(3)),
            'is_active' => $this->faker->boolean(80),
            'launched_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
