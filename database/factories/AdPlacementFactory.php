<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AdPlacement>
 */
class AdPlacementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        $platforms = ['day_news', 'goeventcity', 'downtown_guide', 'alphasite_community', 'golocalvoices'];
        $slots = ['header_leaderboard', 'sidebar_top', 'in_article', 'footer'];
        $platform = $this->faker->randomElement($platforms);
        $slot = $this->faker->randomElement($slots);
        
        return [
            'platform' => $platform,
            'slot' => $slot,
            'name' => $this->faker->sentence(2),
            'description' => $this->faker->optional()->paragraph(),
            'format' => $this->faker->randomElement(['banner', 'square', 'rectangle']),
            'width' => $this->faker->numberBetween(300, 1920),
            'height' => $this->faker->numberBetween(250, 1080),
            'base_cpm' => $this->faker->randomFloat(2, 1, 10),
            'base_cpc' => $this->faker->randomFloat(2, 0.1, 2),
            'is_active' => $this->faker->boolean(80),
            'priority' => $this->faker->numberBetween(1, 10),
        ];
    }
}
