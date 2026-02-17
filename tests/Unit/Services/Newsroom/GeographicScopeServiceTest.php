<?php

declare(strict_types=1);

use App\Models\RawContent;
use App\Models\Region;
use App\Services\Newsroom\GeographicScopeService;

beforeEach(function () {
    $this->service = app(GeographicScopeService::class);
});

it('can be instantiated', function () {
    expect($this->service)->toBeInstanceOf(GeographicScopeService::class);
});

it('resolves all active regions for national scope', function () {
    Region::factory()->active()->count(2)->create();

    $raw = RawContent::create([
        'source_title' => 'National News',
        'source_content' => 'Content',
        'content_hash' => hash('sha256', 'national-'.uniqid()),
        'collection_method' => 'wire',
        'geographic_scope' => 'national',
        'dateline_city' => null,
        'dateline_state' => null,
        'businesses_mentioned' => [],
        'locations_mentioned' => [],
    ]);

    $ids = $this->service->resolveRegions($raw);

    expect($ids)->toHaveCount(2);
});

it('returns empty array when no region can be resolved for local scope', function () {
    $raw = RawContent::create([
        'source_title' => 'Local News',
        'source_content' => 'Content',
        'content_hash' => hash('sha256', 'local-'.uniqid()),
        'collection_method' => 'wire',
        'community_id' => null,
        'dateline_city' => null,
        'dateline_state' => null,
        'businesses_mentioned' => [],
        'locations_mentioned' => [],
        'geographic_scope' => 'local',
    ]);

    $ids = $this->service->resolveRegions($raw);

    expect($ids)->toBeEmpty();
});
