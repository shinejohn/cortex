<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CouponUsage>
 */
class CouponUsageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'coupon_id' => \App\Models\Coupon::factory(),
            'user_id' => $this->faker->optional(0.5)->randomElement([\App\Models\User::factory(), null]),
            'ip_address' => $this->faker->optional()->ipv4(),
        ];
    }
}
