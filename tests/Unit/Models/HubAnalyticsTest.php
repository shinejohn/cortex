<?php

use App\Models\HubAnalytics;

test('can create HubAnalytics', function () {
    $model = HubAnalytics::factory()->create();
    expect($model)->toBeInstanceOf(HubAnalytics::class);
});

test('HubAnalytics has required attributes', function () {
    $model = HubAnalytics::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
