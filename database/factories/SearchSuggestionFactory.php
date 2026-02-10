<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SearchSuggestion>
 */
final class SearchSuggestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'query' => $this->faker->unique()->sentence(3),
            'popularity' => $this->faker->numberBetween(1, 1000),
            'click_count' => $this->faker->numberBetween(0, 500),
        ];
    }
}
