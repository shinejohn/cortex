<?php

use App\Services\News\FactCheckingService;

test('FactCheckingService can be instantiated', function () {
    $service = app(News\FactCheckingService::class);
    expect($service)->toBeInstanceOf(News\FactCheckingService::class);
});
