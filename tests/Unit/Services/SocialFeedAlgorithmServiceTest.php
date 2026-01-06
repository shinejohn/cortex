<?php

use App\Services\SocialFeedAlgorithmService;

test('SocialFeedAlgorithmService can be instantiated', function () {
    $service = app(App\Services\SocialFeedAlgorithmService::class);
    expect($service)->toBeInstanceOf(App\Services\SocialFeedAlgorithmService::class);
});
