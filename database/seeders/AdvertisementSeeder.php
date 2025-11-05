<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Advertisement;
use App\Models\DayNewsPost;
use App\Models\Region;
use Illuminate\Database\Seeder;

final class AdvertisementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get regions
        $chicago = Region::where('slug', 'chicago')->first();
        $naperville = Region::where('slug', 'naperville')->first();
        $aurora = Region::where('slug', 'aurora')->first();

        if (! $chicago || ! $naperville || ! $aurora) {
            $this->command->warn('Regions not found. Run RegionSeeder first.');

            return;
        }

        // Get some published content to advertise
        // Admin articles (workspace_id = null)
        $adminArticles = DayNewsPost::whereNull('workspace_id')->published()->take(3)->get();
        // User posts (type = 'ad')
        $userAdPosts = DayNewsPost::published()->byType('ad')->take(3)->get();

        if ($adminArticles->isEmpty() && $userAdPosts->isEmpty()) {
            $this->command->warn('No published content found. Run NewsSeeder and DayNewsPostSeeder first.');

            return;
        }

        // Create banner ads (1 per region)
        foreach ([$chicago, $naperville, $aurora] as $region) {
            if ($adminArticles->isNotEmpty()) {
                $article = $adminArticles->random();

                Advertisement::create([
                    'platform' => 'day_news',
                    'advertable_type' => DayNewsPost::class,
                    'advertable_id' => $article->id,
                    'placement' => 'banner',
                    'regions' => [$region->id],
                    'impressions_count' => rand(100, 1000),
                    'clicks_count' => rand(10, 100),
                    'starts_at' => now()->subDays(7),
                    'expires_at' => now()->addDays(30),
                    'is_active' => true,
                ]);
            }
        }

        // Create featured ads (1-2 per region)
        foreach ([$chicago, $naperville, $aurora] as $region) {
            $count = rand(1, 2);
            for ($i = 0; $i < $count; $i++) {
                if ($userAdPosts->isNotEmpty()) {
                    $post = $userAdPosts->random();

                    Advertisement::create([
                        'platform' => 'day_news',
                        'advertable_type' => DayNewsPost::class,
                        'advertable_id' => $post->id,
                        'placement' => 'featured',
                        'regions' => [$region->id],
                        'impressions_count' => rand(50, 500),
                        'clicks_count' => rand(5, 50),
                        'starts_at' => now()->subDays(3),
                        'expires_at' => now()->addDays(20),
                        'is_active' => true,
                    ]);
                }
            }
        }

        // Create inline ads (2-3 per region)
        foreach ([$chicago, $naperville, $aurora] as $region) {
            $count = rand(2, 3);
            for ($i = 0; $i < $count; $i++) {
                $advertable = rand(0, 1) === 0 && $adminArticles->isNotEmpty()
                    ? $adminArticles->random()
                    : ($userAdPosts->isNotEmpty() ? $userAdPosts->random() : null);

                if ($advertable) {
                    Advertisement::create([
                        'platform' => 'day_news',
                        'advertable_type' => get_class($advertable),
                        'advertable_id' => $advertable->id,
                        'placement' => 'inline',
                        'regions' => [$region->id],
                        'impressions_count' => rand(200, 800),
                        'clicks_count' => rand(20, 80),
                        'starts_at' => now()->subDays(5),
                        'expires_at' => now()->addDays(25),
                        'is_active' => true,
                    ]);
                }
            }
        }

        // Create sidebar ads (3-4 per region)
        foreach ([$chicago, $naperville, $aurora] as $region) {
            $count = rand(3, 4);
            for ($i = 0; $i < $count; $i++) {
                $advertable = rand(0, 1) === 0 && $adminArticles->isNotEmpty()
                    ? $adminArticles->random()
                    : ($userAdPosts->isNotEmpty() ? $userAdPosts->random() : null);

                if ($advertable) {
                    Advertisement::create([
                        'platform' => 'day_news',
                        'advertable_type' => get_class($advertable),
                        'advertable_id' => $advertable->id,
                        'placement' => 'sidebar',
                        'regions' => [$region->id],
                        'impressions_count' => rand(150, 600),
                        'clicks_count' => rand(15, 60),
                        'starts_at' => now()->subDays(2),
                        'expires_at' => now()->addDays(28),
                        'is_active' => true,
                    ]);
                }
            }
        }

        $this->command->info('Advertisements seeded successfully!');
        $this->command->info('Total advertisements: '.Advertisement::count());
    }
}
