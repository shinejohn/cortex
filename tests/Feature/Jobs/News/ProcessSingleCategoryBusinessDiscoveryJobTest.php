<?php

declare(strict_types=1);

use App\Jobs\News\ProcessSingleCategoryBusinessDiscoveryJob;
use App\Models\Region;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    $this->region = Region::factory()->create();
});

it('tracks completion and decrements counter when job fails', function () {
    $cacheKey = "business_discovery_jobs:{$this->region->id}";
    Cache::put($cacheKey, 5, now()->addHour());

    $job = new ProcessSingleCategoryBusinessDiscoveryJob('restaurant', $this->region);
    $exception = new Exception('Test failure');

    $job->failed($exception);

    expect((int) Cache::get($cacheKey))->toBe(4);
});

it('cleans up cache key when last job fails', function () {
    $cacheKey = "business_discovery_jobs:{$this->region->id}";
    Cache::put($cacheKey, 1, now()->addHour());

    $job = new ProcessSingleCategoryBusinessDiscoveryJob('restaurant', $this->region);
    $exception = new Exception('Test failure');

    $job->failed($exception);

    expect(Cache::has($cacheKey))->toBeFalse();
});

it('does not clean up cache key when failed job is not the last one', function () {
    $cacheKey = "business_discovery_jobs:{$this->region->id}";
    Cache::put($cacheKey, 10, now()->addHour());

    $job = new ProcessSingleCategoryBusinessDiscoveryJob('restaurant', $this->region);
    $exception = new Exception('Test failure');

    $job->failed($exception);

    expect((int) Cache::get($cacheKey))->toBe(9);
    expect(Cache::has($cacheKey))->toBeTrue();
});

it('has correct timeout and retry settings', function () {
    $job = new ProcessSingleCategoryBusinessDiscoveryJob('restaurant', $this->region);

    expect($job->timeout)->toBe(120);
    expect($job->tries)->toBe(2);
    expect($job->backoff)->toBe(30);
    expect($job->failOnTimeout)->toBeTrue();
});

it('stores category and region correctly', function () {
    $job = new ProcessSingleCategoryBusinessDiscoveryJob('bar', $this->region);

    expect($job->category)->toBe('bar');
    expect($job->region->id)->toBe($this->region->id);
});
