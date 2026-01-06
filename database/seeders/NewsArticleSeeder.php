<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsArticle;
use App\Models\Region;
use App\Models\WriterAgent;
use Illuminate\Database\Seeder;

final class NewsArticleSeeder extends Seeder
{
    /**
     * Seed news articles (automated).
     */
    public function run(): void
    {
        $regions = Region::where('type', 'city')->get();
        $writerAgents = WriterAgent::all();

        if ($regions->isEmpty()) {
            $this->command->warn('⚠ No regions found. Run RegionSeeder first.');
            return;
        }

        // Create news articles using factory
        $targetCount = 200;
        $articles = NewsArticle::factory($targetCount)->create([
            'region_id' => fn() => $regions->random()->id,
            'writer_agent_id' => fn() => $writerAgents->isNotEmpty() && rand(0, 1) ? $writerAgents->random()->id : null,
        ]);

        $this->command->info("✓ Created {$targetCount} news articles");
        $this->command->info("✓ Total news articles: " . NewsArticle::count());
    }
}


