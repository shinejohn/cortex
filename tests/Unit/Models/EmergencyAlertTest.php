<?php

use App\Models\EmergencyAlert;

test('can create EmergencyAlert', function () {
    $model = EmergencyAlert::factory()->create();
    expect($model)->toBeInstanceOf(EmergencyAlert::class);
});

test('EmergencyAlert has required attributes', function () {
    $model = EmergencyAlert::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
