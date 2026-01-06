<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\TicketOrder;
use App\Models\TicketOrderItem;
use App\Models\TicketPlan;
use Illuminate\Database\Seeder;

final class TicketOrderItemSeeder extends Seeder
{
    /**
     * Seed ticket order items.
     */
    public function run(): void
    {
        $orders = TicketOrder::all();
        $ticketPlans = TicketPlan::all();

        if ($orders->isEmpty() || $ticketPlans->isEmpty()) {
            $this->command->warn('⚠ No ticket orders or ticket plans found. Run TicketOrderSeeder and TicketPlanSeeder first.');
            return;
        }

        foreach ($orders as $order) {
            // Get ticket plans for this order's event
            $eventPlans = $ticketPlans->where('event_id', $order->event_id);

            if ($eventPlans->isEmpty()) {
                continue;
            }

            // Create 1-3 items per order
            $itemCount = rand(1, 3);
            $selectedPlans = $eventPlans->random(min($itemCount, $eventPlans->count()));

            foreach ($selectedPlans as $plan) {
                TicketOrderItem::firstOrCreate(
                    [
                        'ticket_order_id' => $order->id,
                        'ticket_plan_id' => $plan->id,
                    ],
                    TicketOrderItem::factory()->make([
                        'ticket_order_id' => $order->id,
                        'ticket_plan_id' => $plan->id,
                    ])->toArray()
                );
            }
        }

        $totalItems = TicketOrderItem::count();
        $this->command->info("✓ Total ticket order items: {$totalItems}");
    }
}


