<?php

use App\Models\RssFeed;

test('can create RssFeed', function () {
    $model = RssFeed::factory()->create();
    expect($model)->toBeInstanceOf(RssFeed::class);
});

test('RssFeed has required attributes', function () {
    $model = RssFeed::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
