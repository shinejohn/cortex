<?php

use App\Http\Controllers\DayNews\ArticleCommentController;

test('ArticleCommentController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\DayNews\ArticleCommentController"))->toBeTrue();
});
