<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdCampaign;
use Illuminate\Database\Seeder;

final class AdCampaignSeeder extends Seeder
{
    /**
     * Seed ad campaigns.
     */
    public function run(): void
    {
        $businesses = \App\Models\Business::all();

        if ($businesses->isEmpty()) {
            $this->command->warn('⚠ No businesses found. Run BusinessSeeder first.');

            return;
        }

        // Create campaigns using factory
        $targetCount = 20;
        $campaigns = AdCampaign::factory($targetCount)->create([
            'advertiser_id' => fn () => $businesses->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} ad campaigns");
        $this->command->info('✓ Total ad campaigns: '.AdCampaign::count());
    }
}
