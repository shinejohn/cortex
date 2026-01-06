<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;

final class OrderSeeder extends Seeder
{
    /**
     * Seed e-commerce orders.
     */
    public function run(): void
    {
        $stores = Store::all();
        $users = User::all();

        if ($stores->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No stores or users found. Run StoreSeeder and UserSeeder first.');
            return;
        }

        // Create orders using factory
        $targetCount = 200;
        $orders = Order::factory($targetCount)->create([
            'store_id' => fn() => $stores->random()->id,
            'user_id' => fn() => $users->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} orders");
        $this->command->info("✓ Total orders: " . Order::count());
    }
}


