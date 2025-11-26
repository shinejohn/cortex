<?php

declare(strict_types=1);

use App\Jobs\News\ProcessBusinessNewsCollectionJob;
use App\Models\Business;
use App\Models\Region;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    $this->region = Region::factory()->create();
    $this->business = Business::factory()->create();
});

it('tracks completion and decrements counter when job fails', function () {
    // Set initial counter
    Cache::put("news_collection_jobs:{$this->region->id}", 5, now()->addHour());

    $job = new ProcessBusinessNewsCollectionJob($this->business, $this->region);
    $exception = new Exception('Test failure');

    $job->failed($exception);

    // Verify counter was decremented
    expect(Cache::get("news_collection_jobs:{$this->region->id}"))->toBe(4);
});

it('triggers workflow when last job fails', function () {
    // Set counter to 1 (last job)
    Cache::put("news_collection_jobs:{$this->region->id}", 1, now()->addHour());

    // Mock Artisan facade
    Artisan::shouldReceive('call')
        ->once()
        ->with('news:process-collected', ['--region' => $this->region->id]);

    $job = new ProcessBusinessNewsCollectionJob($this->business, $this->region);
    $exception = new Exception('Test failure');

    $job->failed($exception);

    // Verify cache was cleaned up
    expect(Cache::has("news_collection_jobs:{$this->region->id}"))->toBeFalse();
});

it('does not trigger workflow when failed job is not the last one', function () {
    // Set counter to 10 (many jobs pending)
    Cache::put("news_collection_jobs:{$this->region->id}", 10, now()->addHour());

    // Ensure Artisan is never called
    Artisan::shouldReceive('call')->never();

    $job = new ProcessBusinessNewsCollectionJob($this->business, $this->region);
    $exception = new Exception('Test failure');

    $job->failed($exception);

    // Verify counter was decremented but workflow not triggered
    expect(Cache::get("news_collection_jobs:{$this->region->id}"))->toBe(9);
    expect(Cache::has("news_collection_jobs:{$this->region->id}"))->toBeTrue();
});
