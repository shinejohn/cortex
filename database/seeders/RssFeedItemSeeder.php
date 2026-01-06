<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\RssFeed;
use App\Models\RssFeedItem;
use Illuminate\Database\Seeder;

final class RssFeedItemSeeder extends Seeder
{
    /**
     * Seed RSS feed items.
     */
    public function run(): void
    {
        $feeds = RssFeed::all();

        if ($feeds->isEmpty()) {
            $this->command->warn('⚠ No RSS feeds found. Run RssFeedSeeder first.');
            return;
        }

        foreach ($feeds as $feed) {
            // Create 10-50 items per feed
            $itemCount = rand(10, 50);
            RssFeedItem::factory($itemCount)->create([
                'rss_feed_id' => $feed->id,
            ]);
        }

        $totalItems = RssFeedItem::count();
        $this->command->info("✓ Total RSS feed items: {$totalItems}");
    }
}


