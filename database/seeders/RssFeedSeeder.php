<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Business;
use App\Models\RssFeed;
use Illuminate\Database\Seeder;

final class RssFeedSeeder extends Seeder
{
    /**
     * Seed RSS feeds.
     */
    public function run(): void
    {
        $businesses = Business::all();

        // Create RSS feeds using factory
        $targetCount = 30;
        $feeds = RssFeed::factory($targetCount)->create([
            'business_id' => fn() => $businesses->isNotEmpty() && rand(0, 1) ? $businesses->random()->id : null,
        ]);

        $this->command->info("✓ Created {$targetCount} RSS feeds");
        $this->command->info("✓ Total RSS feeds: " . RssFeed::count());
    }
}


