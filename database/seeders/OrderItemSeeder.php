<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

final class OrderItemSeeder extends Seeder
{
    /**
     * Seed order items.
     */
    public function run(): void
    {
        $orders = Order::all();
        $products = Product::all();

        if ($orders->isEmpty() || $products->isEmpty()) {
            $this->command->warn('⚠ No orders or products found. Run OrderSeeder and ProductSeeder first.');
            return;
        }

        foreach ($orders as $order) {
            // Create 1-5 items per order
            $itemCount = rand(1, 5);
            $availableProducts = $products->random(min($itemCount, $products->count()));

            foreach ($availableProducts as $product) {
                OrderItem::factory()->create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                ]);
            }
        }

        $totalItems = OrderItem::count();
        $this->command->info("✓ Total order items: {$totalItems}");
    }
}


