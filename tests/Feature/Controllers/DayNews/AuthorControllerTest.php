<?php

use App\Http\Controllers\DayNews\AuthorController;

test('AuthorController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\DayNews\AuthorController"))->toBeTrue();
});
