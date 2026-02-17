<?php

declare(strict_types=1);

use App\Services\Newsroom\ContentRoutingService;

it('can be instantiated', function () {
    $service = app(ContentRoutingService::class);
    expect($service)->toBeInstanceOf(ContentRoutingService::class);
});

it('routeClassifiedContent returns stats with zero processed when no pending content', function () {
    $service = app(ContentRoutingService::class);
    $stats = $service->routeClassifiedContent(10);

    expect($stats)->toHaveKeys(['processed', 'articles', 'announcements', 'events', 'memorials', 'errors']);
    expect($stats['processed'])->toBe(0);
});
