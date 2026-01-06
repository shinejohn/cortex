<?php

use App\Services\NewsService;

test('NewsService can be instantiated', function () {
    $service = app(App\Services\NewsService::class);
    expect($service)->toBeInstanceOf(App\Services\NewsService::class);
});
