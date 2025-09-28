<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\TicketOrder;
use App\Models\TicketPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketOrderItem>
 */
final class TicketOrderItemFactory extends Factory
{
    public function definition(): array
    {
        $quantity = $this->faker->numberBetween(1, 8);
        $unitPrice = $this->faker->randomFloat(2, 15, 150);
        $totalPrice = $quantity * $unitPrice;

        return [
            'ticket_order_id' => TicketOrder::factory(),
            'ticket_plan_id' => TicketPlan::factory(),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
        ];
    }

    public function forOrder(TicketOrder $order): static
    {
        return $this->state(fn (array $attributes) => [
            'ticket_order_id' => $order->id,
        ]);
    }

    public function forPlan(TicketPlan $plan): static
    {
        return $this->state(fn (array $attributes) => [
            'ticket_plan_id' => $plan->id,
            'unit_price' => $plan->price,
            'total_price' => $attributes['quantity'] * $plan->price,
        ]);
    }

    public function singleTicket(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 1,
            'total_price' => $attributes['unit_price'],
        ]);
    }

    public function groupPurchase(): static
    {
        return $this->state(function (array $attributes) {
            $quantity = $this->faker->numberBetween(4, 10);

            return [
                'quantity' => $quantity,
                'total_price' => $quantity * $attributes['unit_price'],
            ];
        });
    }
}
