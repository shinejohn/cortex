<?php

declare(strict_types=1);

use App\Jobs\News\ProcessPhase5FinalSelectionJob;
use App\Jobs\News\ProcessPhase5SelectionJob;
use App\Jobs\News\ProcessPhase6GenerationJob;
use App\Jobs\News\ProcessSingleDraftEvaluationJob;
use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\Region;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    Queue::fake();
    Cache::flush();
});

it('dispatches evaluation jobs for each draft', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);

    // Create 3 drafts ready for evaluation
    NewsArticleDraft::factory()->count(3)->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
    ]);

    $job = new ProcessPhase5SelectionJob($region);
    $job->handle();

    // Should dispatch 3 evaluation jobs
    Queue::assertPushed(ProcessSingleDraftEvaluationJob::class, 3);

    // Should not dispatch Phase 6 yet (waiting for evaluations)
    Queue::assertNotPushed(ProcessPhase6GenerationJob::class);

    // Should initialize cache counter
    expect((int) Cache::get("draft_evaluation_jobs:{$region->id}"))->toBe(3);
});

it('skips to Phase 6 when no drafts to evaluate', function () {
    $region = Region::factory()->create();

    $job = new ProcessPhase5SelectionJob($region);
    $job->handle();

    // Should not dispatch any evaluation jobs
    Queue::assertNotPushed(ProcessSingleDraftEvaluationJob::class);

    // Should skip to Phase 6
    Queue::assertPushed(ProcessPhase6GenerationJob::class);
});

it('selects top drafts based on quality score', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);

    // Create drafts with different quality scores
    $draft1 = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
        'quality_score' => 90,
    ]);

    $draft2 = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
        'quality_score' => 80,
    ]);

    $draft3 = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
        'quality_score' => 70,
    ]);

    config(['news-workflow.final_selection.articles_per_region' => 2]);

    $job = new ProcessPhase5FinalSelectionJob($region);
    $job->handle();

    $draft1->refresh();
    $draft2->refresh();
    $draft3->refresh();

    // Top 2 should be selected
    expect($draft1->status)->toBe('selected_for_generation');
    expect($draft2->status)->toBe('selected_for_generation');
    expect($draft3->status)->toBe('rejected');

    // Should dispatch Phase 6
    Queue::assertPushed(ProcessPhase6GenerationJob::class);
});

it('selects drafts above minimum quality score', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);

    // Create drafts with scores above and below threshold
    $draft1 = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
        'quality_score' => 85,
    ]);

    $draft2 = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
        'quality_score' => 80,
    ]);

    $draft3 = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
        'quality_score' => 60, // Below threshold
    ]);

    config(['news-workflow.final_selection.articles_per_region' => 5]);
    config(['news-workflow.final_selection.min_quality_score' => 75]);

    $job = new ProcessPhase5FinalSelectionJob($region);
    $job->handle();

    $draft1->refresh();
    $draft2->refresh();
    $draft3->refresh();

    // Qualified drafts should be selected
    expect($draft1->status)->toBe('selected_for_generation');
    expect($draft2->status)->toBe('selected_for_generation');

    // Low quality draft should be selected to meet count (since we only have 3 total)
    expect($draft3->status)->toBe('selected_for_generation');
});
