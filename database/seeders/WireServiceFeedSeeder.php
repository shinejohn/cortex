<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class WireServiceFeedSeeder extends Seeder
{
    public function run(): void
    {
        $feeds = [
            ['name' => 'PR Newswire - All', 'service_provider' => 'pr_newswire', 'feed_url' => 'https://www.prnewswire.com/rss/news-releases-list.rss'],
            ['name' => 'Business Wire - All', 'service_provider' => 'business_wire', 'feed_url' => 'https://feed.businesswire.com/rss/home/?rss=G1QFDERJXkJeEFpRWA=='],
            ['name' => 'GlobeNewswire - All', 'service_provider' => 'globenewswire', 'feed_url' => 'https://www.globenewswire.com/RssFeed/subjectcode/01-Products%2fServices/feedTitle/GlobeNewswire%20-%20Products%20and%20Services'],
        ];

        foreach ($feeds as $feed) {
            if (DB::table('wire_service_feeds')->where('feed_url', $feed['feed_url'])->exists()) {
                continue;
            }
            DB::table('wire_service_feeds')->insert([
                'id' => Str::uuid(),
                'name' => $feed['name'],
                'service_provider' => $feed['service_provider'],
                'feed_url' => $feed['feed_url'],
                'is_enabled' => true,
                'poll_interval_minutes' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
