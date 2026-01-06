<?php

use App\Models\PodcastEpisode;

test('can create PodcastEpisode', function () {
    $model = PodcastEpisode::factory()->create();
    expect($model)->toBeInstanceOf(PodcastEpisode::class);
});

test('PodcastEpisode has required attributes', function () {
    $model = PodcastEpisode::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
