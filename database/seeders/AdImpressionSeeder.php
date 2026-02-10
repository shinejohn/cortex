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
        $communities = \App\Models\Community::all();

        if ($creatives->isEmpty() || $placements->isEmpty()) {
            $this->command->warn('⚠ No ad creatives or placements found. Run AdCreativeSeeder and AdPlacementSeeder first.');

            return;
        }

        // Create impressions using factory
        $targetCount = 1000;
        AdImpression::factory($targetCount)
            ->recycle($creatives)
            ->recycle($placements)
            ->recycle($communities)
            ->create();

        $this->command->info("✓ Created {$targetCount} ad impressions");
        $this->command->info('✓ Total ad impressions: '.AdImpression::count());
    }
}
