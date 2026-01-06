<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdCampaign;
use App\Models\Advertisement;
use Illuminate\Database\Seeder;

final class AdCampaignSeeder extends Seeder
{
    /**
     * Seed ad campaigns.
     */
    public function run(): void
    {
        $advertisements = Advertisement::all();

        if ($advertisements->isEmpty()) {
            $this->command->warn('⚠ No advertisements found. Run AdvertisementSeeder first.');
            return;
        }

        // Create campaigns using factory
        $targetCount = 20;
        $campaigns = AdCampaign::factory($targetCount)->create([
            'advertisement_id' => fn() => $advertisements->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} ad campaigns");
        $this->command->info("✓ Total ad campaigns: " . AdCampaign::count());
    }
}


