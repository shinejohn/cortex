<?php

use App\Services\AIContentService;

test('AIContentService can be instantiated', function () {
    $service = app(AIContentService::class);
    expect($service)->toBeInstanceOf(AIContentService::class);
});
