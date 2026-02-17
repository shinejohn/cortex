<?php

declare(strict_types=1);

use App\Models\Region;
use App\Services\Newsroom\SearchTrendMiningService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Http::fake([
        'serpapi.com/*' => Http::response([
            'related_queries' => [
                'rising' => [
                    ['query' => 'best tacos', 'extracted_value' => 100, 'value' => 'Breakout'],
                    ['query' => 'local events', 'extracted_value' => 80, 'value' => '80'],
                ],
                'top' => [],
            ],
        ], 200),
    ]);
});

it('can be instantiated', function () {
    $service = app(SearchTrendMiningService::class);
    expect($service)->toBeInstanceOf(SearchTrendMiningService::class);
});

it('mineForRegion stores trends and returns stats', function () {
    $region = Region::factory()->active()->create();
    $service = app(SearchTrendMiningService::class);

    $stats = $service->mineForRegion($region);

    expect($stats)->toHaveKeys(['trends_stored', 'targets_created']);
    expect($stats['trends_stored'])->toBe(2);
});
