<?php

declare(strict_types=1);

use App\Jobs\News\ProcessPhase4FactCheckingJob;
use App\Jobs\News\ProcessPhase5SelectionJob;
use App\Jobs\News\ProcessSingleDraftFactCheckingJob;
use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\Region;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->region = Region::factory()->create();
});

it('dispatches fact-checking jobs for all shortlisted drafts', function () {
    // Create shortlisted drafts
    $articles = NewsArticle::factory()->count(5)->create([
        'region_id' => $this->region->id,
    ]);

    foreach ($articles as $article) {
        NewsArticleDraft::factory()->create([
            'region_id' => $this->region->id,
            'news_article_id' => $article->id,
            'status' => 'shortlisted',
        ]);
    }

    // Don't fake queue - let jobs dispatch normally but they won't run immediately in tests
    $job = new ProcessPhase4FactCheckingJob($this->region);
    $job->handle();

    // Verify cache counter was initialized
    expect(Cache::get("draft_fact_checking_jobs:{$this->region->id}"))->toEqual(5);
});

it('initializes cache counter with correct count', function () {
    $articles = NewsArticle::factory()->count(10)->create([
        'region_id' => $this->region->id,
    ]);

    foreach ($articles as $article) {
        NewsArticleDraft::factory()->create([
            'region_id' => $this->region->id,
            'news_article_id' => $article->id,
            'status' => 'shortlisted',
        ]);
    }

    $job = new ProcessPhase4FactCheckingJob($this->region);
    $job->handle();

    // Verify counter matches draft count
    expect(Cache::get("draft_fact_checking_jobs:{$this->region->id}"))->toEqual(10);
});

it('skips to Phase 5 when fact-checking is disabled', function () {
    config(['news-workflow.fact_checking.enabled' => false]);

    // Create shortlisted drafts
    $articles = NewsArticle::factory()->count(3)->create([
        'region_id' => $this->region->id,
    ]);

    $drafts = [];
    foreach ($articles as $article) {
        $drafts[] = NewsArticleDraft::factory()->create([
            'region_id' => $this->region->id,
            'news_article_id' => $article->id,
            'status' => 'shortlisted',
        ]);
    }

    Queue::fake();

    $job = new ProcessPhase4FactCheckingJob($this->region);
    $job->handle();

    // Verify all shortlisted drafts were updated to 'ready_for_generation'
    foreach ($drafts as $draft) {
        expect($draft->fresh()->status)->toBe('ready_for_generation');
    }

    // Verify no fact-checking jobs were dispatched
    Queue::assertNotPushed(ProcessSingleDraftFactCheckingJob::class);

    // Verify Phase 5 was dispatched directly
    Queue::assertPushed(ProcessPhase5SelectionJob::class);
});

it('skips to Phase 5 when no drafts to process', function () {
    Queue::fake();

    $job = new ProcessPhase4FactCheckingJob($this->region);
    $job->handle();

    // Verify no fact-checking jobs were dispatched
    Queue::assertNotPushed(ProcessSingleDraftFactCheckingJob::class);

    // Verify Phase 5 was dispatched
    Queue::assertPushed(ProcessPhase5SelectionJob::class);

    // Verify no cache counter was set
    expect(Cache::has("draft_fact_checking_jobs:{$this->region->id}"))->toBeFalse();
});

it('only dispatches jobs for shortlisted drafts', function () {
    $article1 = NewsArticle::factory()->create(['region_id' => $this->region->id]);
    $article2 = NewsArticle::factory()->create(['region_id' => $this->region->id]);
    $article3 = NewsArticle::factory()->create(['region_id' => $this->region->id]);

    // Create mix of statuses
    NewsArticleDraft::factory()->create([
        'region_id' => $this->region->id,
        'news_article_id' => $article1->id,
        'status' => 'shortlisted', // Should process
    ]);

    NewsArticleDraft::factory()->create([
        'region_id' => $this->region->id,
        'news_article_id' => $article2->id,
        'status' => 'rejected', // Should skip
    ]);

    NewsArticleDraft::factory()->create([
        'region_id' => $this->region->id,
        'news_article_id' => $article3->id,
        'status' => 'shortlisted', // Should process
    ]);

    $job = new ProcessPhase4FactCheckingJob($this->region);
    $job->handle();

    // Verify cache counter is 2 (only shortlisted drafts)
    expect(Cache::get("draft_fact_checking_jobs:{$this->region->id}"))->toEqual(2);
});

it('only dispatches jobs for drafts in specified region', function () {
    $otherRegion = Region::factory()->create();

    // Create drafts for different regions
    $article1 = NewsArticle::factory()->create(['region_id' => $this->region->id]);
    $article2 = NewsArticle::factory()->create(['region_id' => $otherRegion->id]);

    NewsArticleDraft::factory()->count(3)->create([
        'region_id' => $this->region->id,
        'news_article_id' => $article1->id,
        'status' => 'shortlisted',
    ]);

    NewsArticleDraft::factory()->count(5)->create([
        'region_id' => $otherRegion->id,
        'news_article_id' => $article2->id,
        'status' => 'shortlisted',
    ]);

    $job = new ProcessPhase4FactCheckingJob($this->region);
    $job->handle();

    // Verify cache counter is 3 (only for this region)
    expect(Cache::get("draft_fact_checking_jobs:{$this->region->id}"))->toEqual(3);
});
