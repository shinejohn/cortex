<?php

use App\Models\NotificationLog;

test('can create NotificationLog', function () {
    $model = NotificationLog::factory()->create();
    expect($model)->toBeInstanceOf(NotificationLog::class);
});

test('NotificationLog has required attributes', function () {
    $model = NotificationLog::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
