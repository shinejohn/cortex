<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AdClick>
 */
class AdClickFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'impression_id' => \App\Models\AdImpression::factory(),
            'creative_id' => \App\Models\AdCreative::factory(),
            'ip_hash' => $this->faker->sha256(),
            'cost' => $this->faker->randomFloat(4, 0.01, 0.5),
            'clicked_at' => $this->faker->dateTime(),
        ];
    }
}
