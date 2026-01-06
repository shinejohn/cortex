<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AdInventory>
 */
class AdInventoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'placement_id' => \App\Models\AdPlacement::factory(),
            'community_id' => \App\Models\Community::factory(),
            'date' => $this->faker->date(),
            'total_impressions' => $this->faker->numberBetween(0, 10000),
            'sold_impressions' => $this->faker->numberBetween(0, 5000),
            'delivered_impressions' => $this->faker->numberBetween(0, 5000),
            'revenue' => $this->faker->randomFloat(2, 0, 1000),
        ];
    }
}
