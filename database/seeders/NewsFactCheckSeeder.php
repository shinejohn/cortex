<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsArticle;
use App\Models\NewsFactCheck;
use Illuminate\Database\Seeder;

final class NewsFactCheckSeeder extends Seeder
{
    /**
     * Seed news fact checks.
     */
    public function run(): void
    {
        $articles = NewsArticle::all();

        if ($articles->isEmpty()) {
            $this->command->warn('⚠ No news articles found. Run NewsArticleSeeder first.');
            return;
        }

        // Create fact checks for 30% of articles
        $articlesToCheck = $articles->random(ceil($articles->count() * 0.3));

        foreach ($articlesToCheck as $article) {
            NewsFactCheck::factory()->create([
                'news_article_id' => $article->id,
            ]);
        }

        $totalChecks = NewsFactCheck::count();
        $this->command->info("✓ Total news fact checks: {$totalChecks}");
    }
}


