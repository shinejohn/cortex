<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Event;
use App\Models\TicketOrder;
use App\Models\TicketOrderItem;
use App\Models\User;
use Illuminate\Database\Seeder;

final class TicketOrderSeeder extends Seeder
{
    public function run(): void
    {
        $events = Event::with('ticketPlans')->published()->upcoming()->take(5)->get();
        $users = User::take(20)->get();

        foreach ($events as $event) {
            $ticketPlans = $event->ticketPlans;

            if ($ticketPlans->isEmpty()) {
                continue;
            }

            // Create 5-15 orders per event
            $orderCount = fake()->numberBetween(5, 15);

            for ($i = 0; $i < $orderCount; $i++) {
                $user = $users->random();

                // Create order with realistic data
                $order = TicketOrder::factory()
                    ->for($event)
                    ->for($user)
                    ->create();

                // Add 1-3 different ticket types to each order (but not more than available)
                $maxItems = min(3, $ticketPlans->count());
                $itemCount = fake()->numberBetween(1, $maxItems);
                $orderSubtotal = 0;

                $selectedPlans = $ticketPlans->random($itemCount);

                foreach ($selectedPlans as $plan) {
                    $quantity = fake()->numberBetween(1, 4);
                    $unitPrice = $plan->price;
                    $totalPrice = $quantity * $unitPrice;

                    TicketOrderItem::create([
                        'ticket_order_id' => $order->id,
                        'ticket_plan_id' => $plan->id,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'total_price' => $totalPrice,
                    ]);

                    $orderSubtotal += $totalPrice;

                    // Update available quantity
                    $plan->decrement('available_quantity', $quantity);
                }

                // Update order totals
                $fees = $orderSubtotal * 0.05; // 5% service fee
                $discount = $order->promo_code ? fake()->randomFloat(2, 5, $orderSubtotal * 0.15) : 0;
                $total = $orderSubtotal + $fees - $discount;

                $order->update([
                    'subtotal' => $orderSubtotal,
                    'fees' => $fees,
                    'discount' => $discount,
                    'total' => $total,
                ]);
            }
        }
    }
}
