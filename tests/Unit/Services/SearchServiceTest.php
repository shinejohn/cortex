<?php

use App\Services\SearchService;

test('SearchService can be instantiated', function () {
    $service = app(App\Services\SearchService::class);
    expect($service)->toBeInstanceOf(App\Services\SearchService::class);
});
