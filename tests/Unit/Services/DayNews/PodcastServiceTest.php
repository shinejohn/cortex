<?php

use App\Services\DayNews\PodcastService\PodcastService;

test('PodcastService can be instantiated', function () {
    $service = app(App\Services\DayNews\PodcastService\PodcastService::class);
    expect($service)->toBeInstanceOf(App\Services\DayNews\PodcastService\PodcastService::class);
});
