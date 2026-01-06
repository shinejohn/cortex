<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PromoCodeUsage>
 */
class PromoCodeUsageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'promo_code_id' => \App\Models\PromoCode::factory(),
            'user_id' => \App\Models\User::factory(),
            'ticket_order_id' => \App\Models\TicketOrder::factory(),
            'discount_amount' => $this->faker->randomFloat(2, 0, 1000),
            'original_amount' => $this->faker->randomFloat(2, 0, 1000),
            'final_amount' => $this->faker->randomFloat(2, 0, 1000),
            'used_at' => $this->faker->dateTime(),
        ];
    }
}
