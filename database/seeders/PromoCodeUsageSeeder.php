<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use App\Models\TicketOrder;
use Illuminate\Database\Seeder;

final class PromoCodeUsageSeeder extends Seeder
{
    /**
     * Seed promo code usage.
     */
    public function run(): void
    {
        $promoCodes = PromoCode::all();
        $ticketOrders = TicketOrder::all();

        if ($promoCodes->isEmpty() || $ticketOrders->isEmpty()) {
            $this->command->warn('⚠ No promo codes or ticket orders found. Run PromoCodeSeeder and TicketOrderSeeder first.');
            return;
        }

        // Create usage for 30% of orders
        $ordersToUsePromo = $ticketOrders->random(ceil($ticketOrders->count() * 0.3));

        foreach ($ordersToUsePromo as $order) {
            $promoCode = $promoCodes->random();

            PromoCodeUsage::firstOrCreate(
                [
                    'promo_code_id' => $promoCode->id,
                    'ticket_order_id' => $order->id,
                ],
                PromoCodeUsage::factory()->make([
                    'promo_code_id' => $promoCode->id,
                    'ticket_order_id' => $order->id,
                ])->toArray()
            );
        }

        $totalUsage = PromoCodeUsage::count();
        $this->command->info("✓ Total promo code usage: {$totalUsage}");
    }
}


