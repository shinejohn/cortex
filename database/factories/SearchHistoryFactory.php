<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SearchHistory>
 */
class SearchHistoryFactory extends Factory
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
            'query' => $this->faker->word(),
            'results_count' => $this->faker->numberBetween(0, 100),
            'filters' => $this->faker->word(),
            'ip_address' => $this->faker->word(),
        ];
    }
}
