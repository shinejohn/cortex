<?php

use App\Services\News\FetchFrequencyService;

test('FetchFrequencyService can be instantiated', function () {
    $service = app(News\FetchFrequencyService::class);
    expect($service)->toBeInstanceOf(News\FetchFrequencyService::class);
});
