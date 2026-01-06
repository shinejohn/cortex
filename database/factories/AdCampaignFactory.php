<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AdCampaign>
 */
class AdCampaignFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'uuid' => $this->faker->uuid(),
            'advertiser_id' => \App\Models\Business::factory(),
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->paragraph(),
            'status' => $this->faker->randomElement(['draft', 'pending', 'active', 'paused', 'completed', 'cancelled']),
            'type' => $this->faker->randomElement(['cpm', 'cpc', 'flat_rate', 'sponsored']),
            'budget' => $this->faker->randomFloat(2, 100, 10000),
            'spent' => $this->faker->randomFloat(2, 0, 5000),
            'daily_budget' => $this->faker->optional()->randomFloat(2, 10, 500),
            'start_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'end_date' => $this->faker->dateTimeBetween('+1 month', '+3 months'),
            'targeting' => ['location' => $this->faker->city(), 'age_range' => '18-65'],
            'platforms' => [$this->faker->randomElement(['day_news', 'event_city', 'downtown_guide'])],
        ];
    }
}
