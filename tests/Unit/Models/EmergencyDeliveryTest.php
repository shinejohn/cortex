<?php

use App\Models\EmergencyDelivery;

test('can create EmergencyDelivery', function () {
    $model = EmergencyDelivery::factory()->create();
    expect($model)->toBeInstanceOf(EmergencyDelivery::class);
});

test('EmergencyDelivery has required attributes', function () {
    $model = EmergencyDelivery::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
