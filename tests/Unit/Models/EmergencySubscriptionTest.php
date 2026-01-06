<?php

use App\Models\EmergencySubscription;

test('can create EmergencySubscription', function () {
    $model = EmergencySubscription::factory()->create();
    expect($model)->toBeInstanceOf(EmergencySubscription::class);
});

test('EmergencySubscription has required attributes', function () {
    $model = EmergencySubscription::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
