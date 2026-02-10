<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmailCampaign;
use Illuminate\Database\Seeder;

final class EmailCampaignSeeder extends Seeder
{
    /**
     * Seed email campaigns.
     */
    public function run(): void
    {
        $communities = \App\Models\Community::all();

        if ($communities->isEmpty()) {
            $this->command->warn('⚠ No communities found. Run CommunitySeeder first.');

            return;
        }

        // Create email campaigns using factory
        $targetCount = 20;
        $campaigns = EmailCampaign::factory($targetCount)->create([
            'community_id' => fn () => $communities->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} email campaigns");
        $this->command->info('✓ Total email campaigns: '.EmailCampaign::count());
    }
}
