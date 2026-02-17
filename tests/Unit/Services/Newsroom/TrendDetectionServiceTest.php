<?php

declare(strict_types=1);

use App\Models\Region;
use App\Models\SearchTrend;
use App\Services\Newsroom\TrendDetectionService;

it('can be instantiated', function () {
    $service = app(TrendDetectionService::class);
    expect($service)->toBeInstanceOf(TrendDetectionService::class);
});

it('detectCrossRegionTrends returns topics trending in 2+ regions', function () {
    $r1 = Region::factory()->active()->create();
    $r2 = Region::factory()->active()->create();

    SearchTrend::create([
        'region_id' => $r1->id,
        'query' => 'best pizza',
        'last_checked_at' => now(),
    ]);
    SearchTrend::create([
        'region_id' => $r2->id,
        'query' => 'best pizza',
        'last_checked_at' => now(),
    ]);

    $service = app(TrendDetectionService::class);
    $trends = $service->detectCrossRegionTrends();

    expect($trends)->not->toBeEmpty();
    expect($trends[0]['query'] ?? null)->toBe('best pizza');
    expect($trends[0]['region_count'] ?? 0)->toBe(2);
});

it('getTrendingTopicsForContent returns string array', function () {
    $r1 = Region::factory()->active()->create();
    $r2 = Region::factory()->active()->create();
    SearchTrend::create(['region_id' => $r1->id, 'query' => 'coffee shops', 'last_checked_at' => now()]);
    SearchTrend::create(['region_id' => $r2->id, 'query' => 'coffee shops', 'last_checked_at' => now()]);

    $service = app(TrendDetectionService::class);
    $topics = $service->getTrendingTopicsForContent();

    expect($topics)->toBeArray();
    expect($topics)->toContain('coffee shops');
});
