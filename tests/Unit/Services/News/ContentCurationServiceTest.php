<?php

use App\Services\News\ContentCurationService;

test('ContentCurationService can be instantiated', function () {
    $service = app(News\ContentCurationService::class);
    expect($service)->toBeInstanceOf(News\ContentCurationService::class);
});
