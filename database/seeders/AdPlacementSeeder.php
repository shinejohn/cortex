<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdCampaign;
use App\Models\AdPlacement;
use Illuminate\Database\Seeder;

final class AdPlacementSeeder extends Seeder
{
    /**
     * Seed ad placements.
     */
    public function run(): void
    {
        $campaigns = AdCampaign::all();

        if ($campaigns->isEmpty()) {
            $this->command->warn('⚠ No ad campaigns found. Run AdCampaignSeeder first.');
            return;
        }

        foreach ($campaigns as $campaign) {
            // Create 1-3 placements per campaign
            $placementCount = rand(1, 3);
            AdPlacement::factory($placementCount)->create([
                'campaign_id' => $campaign->id,
            ]);
        }

        $totalPlacements = AdPlacement::count();
        $this->command->info("✓ Total ad placements: {$totalPlacements}");
    }
}


