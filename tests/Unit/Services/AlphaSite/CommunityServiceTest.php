<?php

use App\Services\AlphaSite\CommunityService;

test('CommunityService can be instantiated', function () {
    $service = app(AlphaSite\CommunityService::class);
    expect($service)->toBeInstanceOf(AlphaSite\CommunityService::class);
});
