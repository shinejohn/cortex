<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CartSeeder extends Seeder
{
    /**
     * Seed shopping carts.
     */
    public function run(): void
    {
        $users = User::all();
        $stores = Store::all();

        if ($users->isEmpty() || $stores->isEmpty()) {
            $this->command->warn('⚠ No users or stores found. Run UserSeeder and StoreSeeder first.');

            return;
        }

        // Create carts using factory
        $targetCount = 100;
        $carts = Cart::factory($targetCount)->create([
            'user_id' => fn () => $users->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} carts");
        $this->command->info('✓ Total carts: '.Cart::count());
    }
}
