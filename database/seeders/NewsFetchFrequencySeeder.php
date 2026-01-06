<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsFetchFrequency;
use App\Models\RssFeed;
use Illuminate\Database\Seeder;

final class NewsFetchFrequencySeeder extends Seeder
{
    /**
     * Seed news fetch frequencies.
     */
    public function run(): void
    {
        $feeds = RssFeed::all();

        if ($feeds->isEmpty()) {
            $this->command->warn('⚠ No RSS feeds found. Run RssFeedSeeder first.');
            return;
        }

        foreach ($feeds as $feed) {
            NewsFetchFrequency::firstOrCreate(
                ['rss_feed_id' => $feed->id],
                NewsFetchFrequency::factory()->make([
                    'rss_feed_id' => $feed->id,
                ])->toArray()
            );
        }

        $totalFrequencies = NewsFetchFrequency::count();
        $this->command->info("✓ Total fetch frequencies: {$totalFrequencies}");
    }
}


