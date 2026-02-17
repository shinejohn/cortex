<?php

declare(strict_types=1);

use App\Services\Newsroom\WireServiceCollectionService;

it('can be instantiated', function () {
    $service = app(WireServiceCollectionService::class);
    expect($service)->toBeInstanceOf(WireServiceCollectionService::class);
});

it('collectAll returns stats structure when no feeds due', function () {
    $service = app(WireServiceCollectionService::class);
    $stats = $service->collectAll();

    expect($stats)->toHaveKeys(['feeds_polled', 'items_found', 'items_new', 'items_duplicate', 'errors']);
});
