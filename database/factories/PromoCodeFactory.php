<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PromoCode>
 */
final class PromoCodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => mb_strtoupper($this->faker->unique()->lexify('PROMO-??????')),
            'description' => $this->faker->sentence(),
            'type' => $this->faker->randomElement(['percentage', 'fixed']),
            'value' => $this->faker->randomFloat(2, 5, 50),
            'min_purchase' => $this->faker->optional()->randomFloat(2, 20, 100),
            'max_discount' => $this->faker->optional()->randomFloat(2, 50, 200),
            'usage_limit' => $this->faker->optional()->numberBetween(10, 1000),
            'used_count' => $this->faker->numberBetween(0, 10),
            'is_active' => $this->faker->boolean(80),
            'starts_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'expires_at' => $this->faker->dateTimeBetween('now', '+3 months'),
            'applicable_to' => null, // Can be array/json
            'metadata' => ['campaign' => $this->faker->word()],
        ];
    }
}
