<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

final class CartItemSeeder extends Seeder
{
    /**
     * Seed cart items.
     */
    public function run(): void
    {
        $carts = Cart::all();
        $products = Product::all();

        if ($carts->isEmpty() || $products->isEmpty()) {
            $this->command->warn('⚠ No carts or products found. Run CartSeeder and ProductSeeder first.');
            return;
        }

        foreach ($carts as $cart) {
            // Create 1-5 items per cart
            $itemCount = rand(1, 5);
            $availableProducts = $products->where('store_id', $cart->store_id)->random(min($itemCount, $products->where('store_id', $cart->store_id)->count()));

            foreach ($availableProducts as $product) {
                CartItem::factory()->create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                ]);
            }
        }

        $totalItems = CartItem::count();
        $this->command->info("✓ Total cart items: {$totalItems}");
    }
}


