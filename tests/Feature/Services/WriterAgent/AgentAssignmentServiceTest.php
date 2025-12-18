<?php

declare(strict_types=1);

use App\Models\Region;
use App\Models\WriterAgent;
use App\Services\WriterAgent\AgentAssignmentService;

beforeEach(function () {
    $this->service = new AgentAssignmentService;
});

it('finds agent matching region and category', function () {
    $region = Region::factory()->create();
    $agent = WriterAgent::factory()->create([
        'categories' => ['local_news', 'sports'],
        'is_active' => true,
    ]);
    $agent->regions()->attach($region->id);

    $result = $this->service->findBestAgent($region, 'sports');

    expect($result)->not->toBeNull();
    expect($result->id)->toBe($agent->id);
});

it('returns null when no matching agent exists', function () {
    $region = Region::factory()->create();

    $result = $this->service->findBestAgent($region, 'sports');

    expect($result)->toBeNull();
});

it('prefers agent with fewer articles for load balancing', function () {
    $region = Region::factory()->create();

    $busyAgent = WriterAgent::factory()->create([
        'categories' => ['local_news'],
        'articles_count' => 100,
        'is_active' => true,
    ]);
    $busyAgent->regions()->attach($region->id);

    $freeAgent = WriterAgent::factory()->create([
        'categories' => ['local_news'],
        'articles_count' => 10,
        'is_active' => true,
    ]);
    $freeAgent->regions()->attach($region->id);

    $result = $this->service->findBestAgent($region, 'local_news');

    expect($result->id)->toBe($freeAgent->id);
});

it('falls back to region-only match when category not matched', function () {
    $region = Region::factory()->create();
    $agent = WriterAgent::factory()->create([
        'categories' => ['business', 'health'],
        'is_active' => true,
    ]);
    $agent->regions()->attach($region->id);

    $result = $this->service->findBestAgent($region, 'sports');

    expect($result)->not->toBeNull();
    expect($result->id)->toBe($agent->id);
});

it('falls back to category-only match when region not matched', function () {
    $region = Region::factory()->create();
    $otherRegion = Region::factory()->create();

    $agent = WriterAgent::factory()->create([
        'categories' => ['sports'],
        'is_active' => true,
    ]);
    $agent->regions()->attach($otherRegion->id);

    $result = $this->service->findBestAgent($region, 'sports');

    expect($result)->not->toBeNull();
    expect($result->id)->toBe($agent->id);
});

it('ignores inactive agents', function () {
    $region = Region::factory()->create();
    $agent = WriterAgent::factory()->create([
        'categories' => ['local_news'],
        'is_active' => false,
    ]);
    $agent->regions()->attach($region->id);

    $result = $this->service->findBestAgent($region, 'local_news');

    expect($result)->toBeNull();
});

it('increments agent article count', function () {
    $agent = WriterAgent::factory()->create(['articles_count' => 5]);

    $this->service->incrementArticleCount($agent);

    $agent->refresh();
    expect($agent->articles_count)->toBe(6);
});

it('finds any active agent as last resort', function () {
    $agent = WriterAgent::factory()->create(['is_active' => true]);
    WriterAgent::factory()->create(['is_active' => false]);

    $result = $this->service->findAnyAgent();

    expect($result)->not->toBeNull();
    expect($result->id)->toBe($agent->id);
});
