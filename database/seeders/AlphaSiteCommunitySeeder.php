<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AlphaSiteCommunity;
use App\Models\Business;
use Illuminate\Database\Seeder;

final class AlphaSiteCommunitySeeder extends Seeder
{
    /**
     * Seed AlphaSite communities.
     */
    public function run(): void
    {
        $businesses = Business::all();

        if ($businesses->isEmpty()) {
            $this->command->warn('⚠ No businesses found. Run BusinessSeeder first.');

            return;
        }

        // Create communities using factory
        $targetCount = 20;
        $communities = AlphaSiteCommunity::factory($targetCount)->create();

        $this->command->info("✓ Created {$targetCount} AlphaSite communities");
        $this->command->info('✓ Total AlphaSite communities: '.AlphaSiteCommunity::count());
    }
}
