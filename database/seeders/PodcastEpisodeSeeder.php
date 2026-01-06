<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Podcast;
use App\Models\PodcastEpisode;
use Illuminate\Database\Seeder;

final class PodcastEpisodeSeeder extends Seeder
{
    /**
     * Seed podcast episodes.
     */
    public function run(): void
    {
        $podcasts = Podcast::all();

        if ($podcasts->isEmpty()) {
            $this->command->warn('⚠ No podcasts found. Run PodcastSeeder first.');
            return;
        }

        foreach ($podcasts as $podcast) {
            // Create 5-10 episodes per podcast
            $episodeCount = rand(5, 10);
            PodcastEpisode::factory($episodeCount)->create([
                'podcast_id' => $podcast->id,
            ]);
        }

        $totalEpisodes = PodcastEpisode::count();
        $this->command->info("✓ Total podcast episodes: {$totalEpisodes}");
    }
}


