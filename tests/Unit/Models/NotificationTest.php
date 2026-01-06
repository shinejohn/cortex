<?php

use App\Models\Notification;

test('can create Notification', function () {
    $model = Notification::factory()->create();
    expect($model)->toBeInstanceOf(Notification::class);
});

test('Notification has required attributes', function () {
    $model = Notification::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
