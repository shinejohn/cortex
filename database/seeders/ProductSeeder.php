<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Store;
use Illuminate\Database\Seeder;

final class ProductSeeder extends Seeder
{
    /**
     * Seed products.
     */
    public function run(): void
    {
        $stores = Store::all();

        if ($stores->isEmpty()) {
            $this->command->warn('⚠ No stores found. Run StoreSeeder first.');
            return;
        }

        // Create products using factory
        $targetCount = 200;
        $products = Product::factory($targetCount)->create([
            'store_id' => fn() => $stores->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} products");
        $this->command->info("✓ Total products: " . Product::count());
    }
}


