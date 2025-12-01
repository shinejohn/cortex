<?php

declare(strict_types=1);

use App\Jobs\News\ProcessPhase5SelectionJob;
use App\Jobs\News\ProcessSingleDraftFactCheckingJob;
use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\Region;
use App\Services\News\FactCheckingService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->region = Region::factory()->create();
    $this->article = NewsArticle::factory()->create([
        'region_id' => $this->region->id,
    ]);
    $this->draft = NewsArticleDraft::factory()->create([
        'region_id' => $this->region->id,
        'news_article_id' => $this->article->id,
        'status' => 'shortlisted',
    ]);
});

it('processes draft successfully and updates status', function () {
    // Use partial mock for final class
    $mockService = Mockery::mock(FactCheckingService::class)->makePartial();
    $mockService->shouldReceive('processSingleDraft')
        ->once()
        ->with(Mockery::on(function ($arg) {
            // Simulate the service updating the draft
            $arg->update([
                'status' => 'ready_for_generation',
                'outline' => '# Test Outline',
                'fact_check_confidence' => 85.0,
            ]);

            return $arg->id === $this->draft->id;
        }));

    $this->app->instance(FactCheckingService::class, $mockService);

    // Set cache counter
    Cache::put("draft_fact_checking_jobs:{$this->region->id}", 1, now()->addHour());

    Queue::fake();

    $job = new ProcessSingleDraftFactCheckingJob($this->draft, $this->region);
    $job->handle($mockService);

    // Verify draft was processed
    $this->draft->refresh();
    expect($this->draft->status)->toBe('ready_for_generation');
    expect($this->draft->outline)->toBe('# Test Outline');

    // Verify Phase 5 was dispatched (since counter = 1)
    Queue::assertPushed(ProcessPhase5SelectionJob::class);
});

it('tracks completion and decrements counter when job succeeds', function () {
    // Use partial mock for final class
    $mockService = Mockery::mock(FactCheckingService::class)->makePartial();
    $mockService->shouldReceive('processSingleDraft')
        ->once();

    $this->app->instance(FactCheckingService::class, $mockService);

    // Set counter to 5 (not last job)
    Cache::put("draft_fact_checking_jobs:{$this->region->id}", 5, now()->addHour());

    Queue::fake();

    $job = new ProcessSingleDraftFactCheckingJob($this->draft, $this->region);
    $job->handle($mockService);

    // Verify counter was decremented
    expect(Cache::get("draft_fact_checking_jobs:{$this->region->id}"))->toEqual(4);

    // Verify Phase 5 was NOT dispatched (not last job)
    Queue::assertNotPushed(ProcessPhase5SelectionJob::class);
});

it('marks draft as rejected when job fails', function () {
    // Set cache counter
    Cache::put("draft_fact_checking_jobs:{$this->region->id}", 5, now()->addHour());

    $job = new ProcessSingleDraftFactCheckingJob($this->draft, $this->region);
    $exception = new Exception('AI service unavailable');

    $job->failed($exception);

    // Verify draft was marked as rejected
    $this->draft->refresh();
    expect($this->draft->status)->toBe('rejected');
    expect($this->draft->rejection_reason)->toContain('Fact-checking job failed');

    // Verify counter was decremented
    expect(Cache::get("draft_fact_checking_jobs:{$this->region->id}"))->toEqual(4);
});

it('triggers Phase 5 when last fact-checking job fails', function () {
    // Set counter to 1 (last job)
    Cache::put("draft_fact_checking_jobs:{$this->region->id}", 1, now()->addHour());

    Queue::fake();

    $job = new ProcessSingleDraftFactCheckingJob($this->draft, $this->region);
    $exception = new Exception('AI service unavailable');

    $job->failed($exception);

    // Verify cache was cleaned up
    expect(Cache::has("draft_fact_checking_jobs:{$this->region->id}"))->toBeFalse();

    // Verify Phase 5 was dispatched
    Queue::assertPushed(ProcessPhase5SelectionJob::class);
});

it('does not trigger Phase 5 when failed job is not the last one', function () {
    // Set counter to 10 (many jobs pending)
    Cache::put("draft_fact_checking_jobs:{$this->region->id}", 10, now()->addHour());

    Queue::fake();

    $job = new ProcessSingleDraftFactCheckingJob($this->draft, $this->region);
    $exception = new Exception('AI service unavailable');

    $job->failed($exception);

    // Verify counter was decremented but workflow not triggered
    expect(Cache::get("draft_fact_checking_jobs:{$this->region->id}"))->toEqual(9);
    expect(Cache::has("draft_fact_checking_jobs:{$this->region->id}"))->toBeTrue();

    // Verify Phase 5 was NOT dispatched
    Queue::assertNotPushed(ProcessPhase5SelectionJob::class);
});
