<?php

use App\Http\Controllers\AlphaSite\DirectoryController;

test('DirectoryController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\AlphaSite\DirectoryController"))->toBeTrue();
});
