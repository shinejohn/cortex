<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdInventory;
use App\Models\AdPlacement;
use Illuminate\Database\Seeder;

final class AdInventorySeeder extends Seeder
{
    /**
     * Seed ad inventory.
     */
    public function run(): void
    {
        $placements = AdPlacement::all();

        if ($placements->isEmpty()) {
            $this->command->warn('⚠ No ad placements found. Run AdPlacementSeeder first.');
            return;
        }

        foreach ($placements as $placement) {
            // Create inventory for each placement
            AdInventory::firstOrCreate(
                ['placement_id' => $placement->id],
                AdInventory::factory()->make([
                    'placement_id' => $placement->id,
                ])->toArray()
            );
        }

        $totalInventory = AdInventory::count();
        $this->command->info("✓ Total ad inventory: {$totalInventory}");
    }
}


