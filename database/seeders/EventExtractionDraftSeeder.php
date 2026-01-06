<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EventExtractionDraft;
use App\Models\NewsArticle;
use Illuminate\Database\Seeder;

final class EventExtractionDraftSeeder extends Seeder
{
    /**
     * Seed event extraction drafts.
     */
    public function run(): void
    {
        $articles = NewsArticle::all();

        if ($articles->isEmpty()) {
            $this->command->warn('⚠ No news articles found. Run NewsArticleSeeder first.');
            return;
        }

        // Create extraction drafts for 15% of articles
        $articlesToExtract = $articles->random(ceil($articles->count() * 0.15));

        foreach ($articlesToExtract as $article) {
            EventExtractionDraft::factory()->create([
                'news_article_id' => $article->id,
            ]);
        }

        $totalDrafts = EventExtractionDraft::count();
        $this->command->info("✓ Total event extraction drafts: {$totalDrafts}");
    }
}


