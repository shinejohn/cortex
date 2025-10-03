<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Workspace;
use Exception;
use Illuminate\Database\Seeder;

final class EcommerceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the demo workspace and users
        $workspace = Workspace::where('slug', 'demo-workspace')->first();
        $users = User::where('current_workspace_id', $workspace->id)->get();

        if (! $workspace || $users->isEmpty()) {
            throw new Exception('Demo workspace and users must be created first');
        }

        // Create approved stores with Stripe Connect
        $approvedStores = Store::factory()
            ->count(8)
            ->approved()
            ->withStripe()
            ->state([
                'workspace_id' => $workspace->id,
            ])
            ->create();

        // Create pending stores
        $pendingStores = Store::factory()
            ->count(3)
            ->pending()
            ->state([
                'workspace_id' => $workspace->id,
            ])
            ->create();

        // Create rejected stores
        $rejectedStores = Store::factory()
            ->count(2)
            ->rejected()
            ->state([
                'workspace_id' => $workspace->id,
            ])
            ->create();

        // Create products for approved stores
        $allProducts = collect();

        $approvedStores->each(function ($store) use (&$allProducts) {
            // Each store gets 5-15 products
            $productCount = fake()->numberBetween(5, 15);

            $products = Product::factory()
                ->count($productCount)
                ->state(['store_id' => $store->id])
                ->create();

            // Make some products featured (20%)
            $products->random(min(3, $products->count()))->each(function ($product) {
                $product->update(['is_featured' => true]);
            });

            // Make some products on sale (30%)
            $products->random(min(4, $products->count()))->each(function ($product) {
                $product->update([
                    'compare_at_price' => $product->price * fake()->randomFloat(2, 1.2, 1.8),
                ]);
            });

            // Make a few products out of stock (10%)
            $products->random(min(2, $products->count()))->each(function ($product) {
                if ($product->track_inventory) {
                    $product->update(['quantity' => 0]);
                }
            });

            $allProducts = $allProducts->merge($products);
        });

        // Create orders for the stores
        $approvedStores->each(function ($store) use ($users, $allProducts) {
            // Get products from this store
            $storeProducts = $allProducts->where('store_id', $store->id);

            if ($storeProducts->isEmpty()) {
                return;
            }

            // Create 3-12 orders per store
            $orderCount = fake()->numberBetween(3, 12);

            for ($i = 0; $i < $orderCount; $i++) {
                $user = $users->random();

                // Randomly pick order state
                $state = fake()->randomElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

                $order = Order::factory()
                    ->$state()
                    ->state([
                        'store_id' => $store->id,
                        'user_id' => $user->id,
                        'customer_name' => $user->name,
                        'customer_email' => $user->email,
                    ])
                    ->create();

                // Add 1-4 products to each order
                $itemCount = fake()->numberBetween(1, 4);
                $orderProducts = $storeProducts->random(min($itemCount, $storeProducts->count()));

                $subtotal = 0;

                foreach ($orderProducts as $product) {
                    $quantity = fake()->numberBetween(1, 3);
                    $price = $product->price;
                    $total = $price * $quantity;

                    OrderItem::factory()
                        ->forProduct($product)
                        ->state([
                            'order_id' => $order->id,
                            'quantity' => $quantity,
                            'price' => $price,
                            'total' => $total,
                        ])
                        ->create();

                    $subtotal += $total;
                }

                // Update order totals
                $tax = $subtotal * 0.08;
                $shipping = fake()->randomElement([0, 5.99, 9.99, 14.99]);
                $total = $subtotal + $tax + $shipping;

                $order->update([
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'shipping' => $shipping,
                    'total' => $total,
                ]);
            }
        });

        // Create a featured store with specific products
        $featuredStore = Store::factory()
            ->approved()
            ->withStripe()
            ->state([
                'workspace_id' => $workspace->id,
                'name' => 'Tech Haven Premium',
                'description' => 'Your one-stop shop for premium tech accessories and gadgets. We offer the latest in technology with fast shipping and excellent customer service.',
                'logo' => 'https://api.dicebear.com/7.x/initials/svg?seed='.urlencode('Tech Haven Premium').'&backgroundColor=4f46e5',
                'banner' => 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            ])
            ->create();

        // Create featured products for the featured store
        $featuredProducts = [
            [
                'name' => 'Premium Wireless Headphones',
                'description' => 'Experience crystal-clear audio with our premium wireless headphones. Features active noise cancellation, 30-hour battery life, and premium comfort.',
                'price' => 249.99,
                'compare_at_price' => 349.99,
                'quantity' => 25,
                'is_featured' => true,
            ],
            [
                'name' => 'Smart Watch Pro',
                'description' => 'Stay connected with our latest smart watch. Track your fitness, receive notifications, and enjoy a stunning AMOLED display.',
                'price' => 399.99,
                'compare_at_price' => null,
                'quantity' => 15,
                'is_featured' => true,
            ],
            [
                'name' => 'Portable Bluetooth Speaker',
                'description' => 'Take your music anywhere with this waterproof portable speaker. 360-degree sound and 20-hour battery life.',
                'price' => 79.99,
                'compare_at_price' => 99.99,
                'quantity' => 50,
                'is_featured' => true,
            ],
            [
                'name' => 'Wireless Charging Pad',
                'description' => 'Fast wireless charging for all your Qi-enabled devices. Sleek design and efficient charging.',
                'price' => 39.99,
                'compare_at_price' => null,
                'quantity' => 100,
                'is_featured' => false,
            ],
            [
                'name' => 'USB-C Hub Adapter',
                'description' => 'Expand your laptop connectivity with 7 ports including HDMI, USB 3.0, and SD card reader.',
                'price' => 49.99,
                'compare_at_price' => 69.99,
                'quantity' => 35,
                'is_featured' => false,
            ],
        ];

        $productImages = [
            'headphones' => [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            ],
            'smartwatch' => [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            ],
            'speaker' => [
                'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1589003077984-894e133dabab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            ],
            'charger' => [
                'https://images.unsplash.com/photo-1591290619762-0327eeb9bd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            ],
            'hub' => [
                'https://images.unsplash.com/photo-1625948515291-69613efd103f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            ],
        ];

        foreach ($featuredProducts as $index => $productData) {
            $imageKey = match ($index) {
                0 => 'headphones',
                1 => 'smartwatch',
                2 => 'speaker',
                3 => 'charger',
                4 => 'hub',
                default => 'headphones',
            };

            Product::factory()
                ->state(array_merge($productData, [
                    'store_id' => $featuredStore->id,
                    'images' => $productImages[$imageKey],
                ]))
                ->create();
        }

        // Create some orders for the featured store
        for ($i = 0; $i < 8; $i++) {
            $user = $users->random();
            $state = fake()->randomElement(['processing', 'shipped', 'delivered']);

            $order = Order::factory()
                ->$state()
                ->state([
                    'store_id' => $featuredStore->id,
                    'user_id' => $user->id,
                    'customer_name' => $user->name,
                    'customer_email' => $user->email,
                ])
                ->create();

            $storeProducts = Product::where('store_id', $featuredStore->id)->get();
            $orderProducts = $storeProducts->random(min(2, $storeProducts->count()));

            $subtotal = 0;

            foreach ($orderProducts as $product) {
                $quantity = fake()->numberBetween(1, 2);
                $price = $product->price;
                $total = $price * $quantity;

                OrderItem::factory()
                    ->forProduct($product)
                    ->state([
                        'order_id' => $order->id,
                        'quantity' => $quantity,
                        'price' => $price,
                        'total' => $total,
                    ])
                    ->create();

                $subtotal += $total;
            }

            // Update order totals
            $tax = $subtotal * 0.08;
            $shipping = 9.99;
            $total = $subtotal + $tax + $shipping;

            $order->update([
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'total' => $total,
            ]);
        }

        $this->command->info('Ecommerce data seeded successfully!');
        $this->command->info("Created {$approvedStores->count()} approved stores");
        $this->command->info("Created {$pendingStores->count()} pending stores");
        $this->command->info("Created {$rejectedStores->count()} rejected stores");
        $this->command->info("Created {$allProducts->count()} total products");
    }
}
