<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketGift>
 */
class TicketGiftFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'ticket_order_item_id' => \App\Models\TicketOrderItem::factory(),
            'gifter_id' => \App\Models\User::factory(),
            'recipient_email' => $this->faker->email(),
            'recipient_name' => $this->faker->sentence(),
            'recipient_user_id' => $this->faker->optional()->randomElement([\App\Models\User::factory(), null]),
            'status' => $this->faker->randomElement(['pending', 'redeemed', 'cancelled', 'expired']),
            'gift_token' => \Illuminate\Support\Str::uuid(),
            'message' => $this->faker->optional()->sentence(),
            'gifted_at' => $this->faker->optional()->dateTime(),
            'redeemed_at' => $this->faker->optional()->dateTime(),
            'expires_at' => $this->faker->optional()->dateTime(),
        ];
    }
}
