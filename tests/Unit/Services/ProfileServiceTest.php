<?php

use App\Services\ProfileService;

test('ProfileService can be instantiated', function () {
    $service = app(ProfileService::class);
    expect($service)->toBeInstanceOf(ProfileService::class);
});
