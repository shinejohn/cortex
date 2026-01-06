<?php

use App\Http\Controllers\Api\NotificationController;

test('NotificationController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\Api\NotificationController"))->toBeTrue();
});
