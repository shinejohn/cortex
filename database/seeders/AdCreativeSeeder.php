<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdCampaign;
use App\Models\AdCreative;
use Illuminate\Database\Seeder;

final class AdCreativeSeeder extends Seeder
{
    /**
     * Seed ad creatives.
     */
    public function run(): void
    {
        $campaigns = AdCampaign::all();

        if ($campaigns->isEmpty()) {
            $this->command->warn('⚠ No ad campaigns found. Run AdCampaignSeeder first.');
            return;
        }

        foreach ($campaigns as $campaign) {
            // Create 2-5 creatives per campaign
            $creativeCount = rand(2, 5);
            AdCreative::factory($creativeCount)->create([
                'campaign_id' => $campaign->id,
            ]);
        }

        $totalCreatives = AdCreative::count();
        $this->command->info("✓ Total ad creatives: {$totalCreatives}");
    }
}


