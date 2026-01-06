<?php

use App\Http\Controllers\Api\N8nIntegrationController;

test('N8nIntegrationController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\Api\N8nIntegrationController"))->toBeTrue();
});
