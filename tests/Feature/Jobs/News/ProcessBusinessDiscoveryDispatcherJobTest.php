<?php

declare(strict_types=1);

use App\Jobs\News\ProcessBusinessDiscoveryDispatcherJob;
use App\Jobs\News\ProcessSingleCategoryBusinessDiscoveryJob;
use App\Models\Region;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->region = Region::factory()->create();
});

it('dispatches jobs for all configured categories', function () {
    Queue::fake();

    $job = new ProcessBusinessDiscoveryDispatcherJob($this->region);
    $job->handle();

    $categories = config('news-workflow.business_discovery.categories', []);

    Queue::assertPushed(ProcessSingleCategoryBusinessDiscoveryJob::class, count($categories));

    // Verify each category has a dispatched job
    foreach ($categories as $category) {
        Queue::assertPushed(ProcessSingleCategoryBusinessDiscoveryJob::class, function ($job) use ($category) {
            return $job->category === $category && $job->region->id === $this->region->id;
        });
    }
});

it('initializes cache counter with category count', function () {
    Queue::fake();

    $job = new ProcessBusinessDiscoveryDispatcherJob($this->region);
    $job->handle();

    $categories = config('news-workflow.business_discovery.categories', []);
    $cacheKey = "business_discovery_jobs:{$this->region->id}";

    expect((int) Cache::get($cacheKey))->toBe(count($categories));
});

it('skips when business discovery is disabled', function () {
    Queue::fake();
    config(['news-workflow.business_discovery.enabled' => false]);

    $job = new ProcessBusinessDiscoveryDispatcherJob($this->region);
    $job->handle();

    Queue::assertNotPushed(ProcessSingleCategoryBusinessDiscoveryJob::class);
});

it('handles empty categories array gracefully', function () {
    Queue::fake();
    config(['news-workflow.business_discovery.categories' => []]);

    $job = new ProcessBusinessDiscoveryDispatcherJob($this->region);
    $job->handle();

    Queue::assertNotPushed(ProcessSingleCategoryBusinessDiscoveryJob::class);
});
