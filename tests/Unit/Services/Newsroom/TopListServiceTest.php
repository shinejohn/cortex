<?php

declare(strict_types=1);

use App\Models\Region;
use App\Services\News\GooglePlacesService;
use App\Services\News\PrismAiService;
use App\Services\Newsroom\TopListService;

beforeEach(function () {
    config(['news-workflow.top_list.enabled' => true]);

    $placesMock = Mockery::mock(GooglePlacesService::class);
    $placesMock->shouldReceive('discoverBusinessesForCategory')
        ->andReturn([
            ['name' => 'Biz A', 'google_place_id' => 'gp1', 'address' => '123 Main', 'city' => 'Test', 'state' => 'FL'],
            ['name' => 'Biz B', 'google_place_id' => 'gp2', 'address' => '456 Oak', 'city' => 'Test', 'state' => 'FL'],
            ['name' => 'Biz C', 'google_place_id' => 'gp3', 'address' => '789 Elm', 'city' => 'Test', 'state' => 'FL'],
            ['name' => 'Biz D', 'google_place_id' => 'gp4', 'address' => '101 Pine', 'city' => 'Test', 'state' => 'FL'],
        ]);

    $aiMock = Mockery::mock(PrismAiService::class);
    $aiMock->shouldReceive('generateJson')->andReturn([
        'title' => 'Best Restaurants in Test',
        'content' => '<p>Content</p>',
        'excerpt' => 'Excerpt',
    ]);

    $this->app->instance(GooglePlacesService::class, $placesMock);
    $this->app->instance(PrismAiService::class, $aiMock);
});

it('can be instantiated', function () {
    $service = app(TopListService::class);
    expect($service)->toBeInstanceOf(TopListService::class);
});

it('runForRegion creates article and poll when sufficient businesses', function () {
    $region = Region::factory()->active()->create();
    $service = app(TopListService::class);

    $article = $service->runForRegion($region);

    expect($article)->not->toBeNull();
    expect($article->editorial_post_id)->not->toBeNull();
    expect($article->poll_id)->not->toBeNull();
});
