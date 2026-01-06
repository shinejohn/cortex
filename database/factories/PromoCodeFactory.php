<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PromoCode>
 */
class PromoCodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'code' => $this->faker->word(),
            'description' => $this->faker->paragraph(),
            'type' => $this->faker->word(),
            'value' => $this->faker->word(),
            'min_purchase' => $this->faker->word(),
            'max_discount' => $this->faker->numberBetween(0, 100),
            'usage_limit' => $this->faker->word(),
            'used_count' => $this->faker->numberBetween(0, 100),
            'is_active' => $this->faker->boolean(),
            'starts_at' => $this->faker->dateTime(),
            'expires_at' => $this->faker->dateTime(),
            'applicable_to' => $this->faker->word(),
            'metadata' => $this->faker->dateTime(),
        ];
    }
}
