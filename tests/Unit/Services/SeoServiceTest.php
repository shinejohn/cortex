<?php

use App\Services\SeoService;

test('SeoService can be instantiated', function () {
    $service = app(App\Services\SeoService::class);
    expect($service)->toBeInstanceOf(App\Services\SeoService::class);
});
