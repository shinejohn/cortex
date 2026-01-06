<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdCreative;
use App\Models\AdImpression;
use App\Models\AdPlacement;
use Illuminate\Database\Seeder;

final class AdImpressionSeeder extends Seeder
{
    /**
     * Seed ad impressions.
     */
    public function run(): void
    {
        $creatives = AdCreative::all();
        $placements = AdPlacement::all();

        if ($creatives->isEmpty() || $placements->isEmpty()) {
            $this->command->warn('⚠ No ad creatives or placements found. Run AdCreativeSeeder and AdPlacementSeeder first.');
            return;
        }

        // Create impressions using factory
        $targetCount = 1000;
        $impressions = AdImpression::factory($targetCount)->create([
            'creative_id' => fn() => $creatives->random()->id,
            'placement_id' => fn() => $placements->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} ad impressions");
        $this->command->info("✓ Total ad impressions: " . AdImpression::count());
    }
}


