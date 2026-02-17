<?php

declare(strict_types=1);

use App\Services\Newsroom\FillerBucketService;

it('can be instantiated', function () {
    $service = app(FillerBucketService::class);
    expect($service)->toBeInstanceOf(FillerBucketService::class);
});
