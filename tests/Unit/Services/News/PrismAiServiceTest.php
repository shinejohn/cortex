<?php

use App\Services\News\PrismAiService;

test('PrismAiService can be instantiated', function () {
    $service = app(News\PrismAiService::class);
    expect($service)->toBeInstanceOf(News\PrismAiService::class);
});
