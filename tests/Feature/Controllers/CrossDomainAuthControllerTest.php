<?php

use App\Http\Controllers\CrossDomainAuthController;

test('CrossDomainAuthController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\CrossDomainAuthController"))->toBeTrue();
});
