<?php

use App\Services\News\ArticleGenerationService;

test('ArticleGenerationService can be instantiated', function () {
    $service = app(News\ArticleGenerationService::class);
    expect($service)->toBeInstanceOf(News\ArticleGenerationService::class);
});
