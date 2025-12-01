<?php

declare(strict_types=1);

use App\Jobs\News\ProcessPhase3ShortlistingJob;
use App\Jobs\News\ProcessPhase4FactCheckingJob;
use App\Jobs\News\ProcessSingleArticleScoringJob;
use App\Models\NewsArticle;
use App\Models\Region;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->region = Region::factory()->create();
});

it('dispatches scoring jobs for all unprocessed articles', function () {
    // Create unprocessed articles
    $articles = NewsArticle::factory()->count(5)->create([
        'region_id' => $this->region->id,
        'processed' => false,
    ]);

    Queue::fake();

    $job = new ProcessPhase3ShortlistingJob($this->region);
    $job->handle();

    // Verify cache counter was initialized
    expect(Cache::get("article_scoring_jobs:{$this->region->id}"))->toEqual(5);

    // Verify scoring jobs were dispatched
    Queue::assertPushed(ProcessSingleArticleScoringJob::class, 5);
});

it('initializes cache counter with correct count', function () {
    NewsArticle::factory()->count(10)->create([
        'region_id' => $this->region->id,
        'processed' => false,
    ]);

    Queue::fake();

    $job = new ProcessPhase3ShortlistingJob($this->region);
    $job->handle();

    // Verify counter matches article count
    expect(Cache::get("article_scoring_jobs:{$this->region->id}"))->toEqual(10);
});

it('skips to phase 4 when shortlisting is disabled', function () {
    config(['news-workflow.shortlisting.enabled' => false]);

    Queue::fake();

    $job = new ProcessPhase3ShortlistingJob($this->region);
    $job->handle();

    // Verify no scoring jobs were dispatched
    Queue::assertNotPushed(ProcessSingleArticleScoringJob::class);

    // Verify Phase 4 was dispatched directly
    Queue::assertPushed(ProcessPhase4FactCheckingJob::class);
});

it('skips to phase 4 when no articles to process', function () {
    Queue::fake();

    $job = new ProcessPhase3ShortlistingJob($this->region);
    $job->handle();

    // Verify no scoring jobs were dispatched
    Queue::assertNotPushed(ProcessSingleArticleScoringJob::class);

    // Verify Phase 4 was dispatched
    Queue::assertPushed(ProcessPhase4FactCheckingJob::class);

    // Verify no cache counter was set
    expect(Cache::has("article_scoring_jobs:{$this->region->id}"))->toBeFalse();
});

it('only dispatches jobs for unprocessed articles', function () {
    // Create mix of processed and unprocessed articles
    NewsArticle::factory()->count(3)->create([
        'region_id' => $this->region->id,
        'processed' => true, // Already processed
    ]);

    NewsArticle::factory()->count(2)->create([
        'region_id' => $this->region->id,
        'processed' => false, // Unprocessed
    ]);

    Queue::fake();

    $job = new ProcessPhase3ShortlistingJob($this->region);
    $job->handle();

    // Verify only 2 scoring jobs were dispatched (for unprocessed articles)
    Queue::assertPushed(ProcessSingleArticleScoringJob::class, 2);

    // Verify cache counter is 2
    expect(Cache::get("article_scoring_jobs:{$this->region->id}"))->toEqual(2);
});

it('only dispatches jobs for articles in specified region', function () {
    $otherRegion = Region::factory()->create();

    // Create articles for different regions
    NewsArticle::factory()->count(3)->create([
        'region_id' => $this->region->id,
        'processed' => false,
    ]);

    NewsArticle::factory()->count(5)->create([
        'region_id' => $otherRegion->id,
        'processed' => false,
    ]);

    Queue::fake();

    $job = new ProcessPhase3ShortlistingJob($this->region);
    $job->handle();

    // Verify only 3 scoring jobs were dispatched (for this region)
    Queue::assertPushed(ProcessSingleArticleScoringJob::class, 3);

    // Verify cache counter is 3
    expect(Cache::get("article_scoring_jobs:{$this->region->id}"))->toEqual(3);
});
