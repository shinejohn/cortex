<?php

use App\Services\GamificationService;

test('GamificationService can be instantiated', function () {
    $service = app(GamificationService::class);
    expect($service)->toBeInstanceOf(GamificationService::class);
});
