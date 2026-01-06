<?php

use App\Services\AIService;

test('AIService can be instantiated', function () {
    $service = app(App\Services\AIService::class);
    expect($service)->toBeInstanceOf(App\Services\AIService::class);
});
