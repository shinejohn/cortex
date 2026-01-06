<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use Illuminate\Database\Seeder;

final class NewsArticleDraftSeeder extends Seeder
{
    /**
     * Seed news article drafts.
     */
    public function run(): void
    {
        $articles = NewsArticle::all();

        if ($articles->isEmpty()) {
            $this->command->warn('⚠ No news articles found. Run NewsArticleSeeder first.');
            return;
        }

        // Create drafts for 20% of articles
        $articlesToDraft = $articles->random(ceil($articles->count() * 0.2));

        foreach ($articlesToDraft as $article) {
            NewsArticleDraft::factory()->create([
                'news_article_id' => $article->id,
            ]);
        }

        $totalDrafts = NewsArticleDraft::count();
        $this->command->info("✓ Total news article drafts: {$totalDrafts}");
    }
}


