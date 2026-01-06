<?php

use App\Models\UpcomingShow;

test('can create UpcomingShow', function () {
    $model = UpcomingShow::factory()->create();
    expect($model)->toBeInstanceOf(UpcomingShow::class);
});

test('UpcomingShow has required attributes', function () {
    $model = UpcomingShow::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
