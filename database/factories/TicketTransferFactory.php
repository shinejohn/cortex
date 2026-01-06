<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketTransfer>
 */
class TicketTransferFactory extends Factory
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
            'from_user_id' => \App\Models\User::factory(),
            'to_user_id' => $this->faker->optional()->randomElement([\App\Models\User::factory(), null]),
            'to_email' => $this->faker->email(),
            'status' => $this->faker->randomElement(['pending', 'completed', 'cancelled', 'expired']),
            'transfer_token' => \Illuminate\Support\Str::uuid(),
            'message' => $this->faker->optional()->sentence(),
            'transferred_at' => $this->faker->optional()->dateTime(),
            'expires_at' => $this->faker->optional()->dateTime(),
        ];
    }
}
