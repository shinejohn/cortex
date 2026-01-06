<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketListing>
 */
class TicketListingFactory extends Factory
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
            'seller_id' => \App\Models\User::factory(),
            'event_id' => \App\Models\Event::factory(),
            'price' => $this->faker->randomFloat(2, 0, 1000),
            'quantity' => $this->faker->numberBetween(0, 100),
            'status' => $this->faker->randomElement(['active', 'sold', 'cancelled', 'expired']),
            'description' => $this->faker->optional()->paragraph(),
            'expires_at' => $this->faker->optional()->dateTime(),
            'sold_at' => $this->faker->optional()->dateTime(),
            'sold_to' => $this->faker->optional()->randomElement([\App\Models\User::factory(), null]),
        ];
    }
}
