<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Coupon>
 */
class CouponFactory extends Factory
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
            'business_id' => \App\Models\Business::factory(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'discount_type' => $this->faker->randomElement(['percentage', 'fixed_amount', 'buy_one_get_one', 'free_item']),
            'discount_value' => $this->faker->randomFloat(2, 1, 50),
            'terms' => $this->faker->word(),
            'code' => $this->faker->word(),
            'image' => $this->faker->optional()->url(),
            'business_name' => $this->faker->sentence(),
            'business_location' => $this->faker->optional()->city(),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'usage_limit' => $this->faker->optional()->numberBetween(1, 1000),
            'used_count' => $this->faker->numberBetween(0, 100),
            'status' => $this->faker->randomElement(['draft', 'active', 'expired', 'disabled']),
            'views_count' => $this->faker->numberBetween(0, 100),
            'clicks_count' => $this->faker->numberBetween(0, 100),
        ];
    }
}
