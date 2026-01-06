<?php

use App\Http\Controllers\HubController;

test('HubController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\HubController"))->toBeTrue();
});
