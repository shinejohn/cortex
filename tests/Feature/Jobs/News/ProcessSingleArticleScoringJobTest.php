<?php

declare(strict_types=1);

use App\Jobs\News\ProcessPhase3SelectionJob;
use App\Jobs\News\ProcessSingleArticleScoringJob;
use App\Models\NewsArticle;
use App\Models\Region;
use App\Services\News\PrismAiService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->region = Region::factory()->create();
    $this->article = NewsArticle::factory()->create([
        'region_id' => $this->region->id,
        'processed' => false,
    ]);
});

it('scores article successfully and stores results', function () {
    // Mock PrismAiService
    $mockPrismAi = Mockery::mock(PrismAiService::class);
    $mockPrismAi->shouldReceive('scoreArticleRelevance')
        ->once()
        ->andReturn([
            'relevance_score' => 85.5,
            'topic_tags' => ['events', 'downtown'],
            'rationale' => 'Highly relevant article about local events',
        ]);

    $this->app->instance(PrismAiService::class, $mockPrismAi);

    // Set cache counter
    Cache::put("article_scoring_jobs:{$this->region->id}", 1, now()->addHour());

    Queue::fake();

    $job = new ProcessSingleArticleScoringJob($this->article, $this->region);
    $job->handle($mockPrismAi);

    // Verify article was updated
    $this->article->refresh();
    expect((float) $this->article->relevance_score)->toBe(85.5);
    expect($this->article->relevance_topic_tags)->toBe(['events', 'downtown']);
    expect($this->article->relevance_rationale)->toBe('Highly relevant article about local events');
    expect($this->article->scored_at)->not->toBeNull();

    // Verify selection job was dispatched (since counter = 1)
    Queue::assertPushed(ProcessPhase3SelectionJob::class);
});

it('tracks completion and decrements counter when job succeeds', function () {
    // Mock PrismAiService
    $mockPrismAi = Mockery::mock(PrismAiService::class);
    $mockPrismAi->shouldReceive('scoreArticleRelevance')
        ->once()
        ->andReturn([
            'relevance_score' => 75.0,
            'topic_tags' => ['news'],
            'rationale' => 'Good article',
        ]);

    $this->app->instance(PrismAiService::class, $mockPrismAi);

    // Set counter to 5 (not last job)
    Cache::put("article_scoring_jobs:{$this->region->id}", 5, now()->addHour());

    Queue::fake();

    $job = new ProcessSingleArticleScoringJob($this->article, $this->region);
    $job->handle($mockPrismAi);

    // Verify counter was decremented
    expect(Cache::get("article_scoring_jobs:{$this->region->id}"))->toEqual(4);

    // Verify selection job was NOT dispatched (not last job)
    Queue::assertNotPushed(ProcessPhase3SelectionJob::class);
});

it('marks article with low score when job fails', function () {
    // Set cache counter
    Cache::put("article_scoring_jobs:{$this->region->id}", 5, now()->addHour());

    $job = new ProcessSingleArticleScoringJob($this->article, $this->region);
    $exception = new Exception('AI service unavailable');

    $job->failed($exception);

    // Verify article was marked with score 0
    $this->article->refresh();
    expect((float) $this->article->relevance_score)->toBe(0.0);
    expect($this->article->scored_at)->not->toBeNull();

    // Verify counter was decremented
    expect(Cache::get("article_scoring_jobs:{$this->region->id}"))->toEqual(4);
});

it('triggers selection job when last scoring job fails', function () {
    // Set counter to 1 (last job)
    Cache::put("article_scoring_jobs:{$this->region->id}", 1, now()->addHour());

    Queue::fake();

    $job = new ProcessSingleArticleScoringJob($this->article, $this->region);
    $exception = new Exception('AI service unavailable');

    $job->failed($exception);

    // Verify cache was cleaned up
    expect(Cache::has("article_scoring_jobs:{$this->region->id}"))->toBeFalse();

    // Verify selection job was dispatched
    Queue::assertPushed(ProcessPhase3SelectionJob::class);
});

it('does not trigger selection when failed job is not the last one', function () {
    // Set counter to 10 (many jobs pending)
    Cache::put("article_scoring_jobs:{$this->region->id}", 10, now()->addHour());

    Queue::fake();

    $job = new ProcessSingleArticleScoringJob($this->article, $this->region);
    $exception = new Exception('AI service unavailable');

    $job->failed($exception);

    // Verify counter was decremented but workflow not triggered
    expect(Cache::get("article_scoring_jobs:{$this->region->id}"))->toEqual(9);
    expect(Cache::has("article_scoring_jobs:{$this->region->id}"))->toBeTrue();

    // Verify selection job was NOT dispatched
    Queue::assertNotPushed(ProcessPhase3SelectionJob::class);
});
