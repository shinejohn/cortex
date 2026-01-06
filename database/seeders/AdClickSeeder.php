<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdClick;
use App\Models\AdCreative;
use App\Models\AdPlacement;
use Illuminate\Database\Seeder;

final class AdClickSeeder extends Seeder
{
    /**
     * Seed ad clicks.
     */
    public function run(): void
    {
        $creatives = AdCreative::all();
        $placements = AdPlacement::all();

        if ($creatives->isEmpty() || $placements->isEmpty()) {
            $this->command->warn('⚠ No ad creatives or placements found. Run AdCreativeSeeder and AdPlacementSeeder first.');
            return;
        }

        // Create clicks using factory (10% of impressions)
        $targetCount = 100;
        $clicks = AdClick::factory($targetCount)->create([
            'creative_id' => fn() => $creatives->random()->id,
            'placement_id' => fn() => $placements->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} ad clicks");
        $this->command->info("✓ Total ad clicks: " . AdClick::count());
    }
}


