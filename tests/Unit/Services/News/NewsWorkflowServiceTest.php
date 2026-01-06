<?php

use App\Services\News\NewsWorkflowService;

test('NewsWorkflowService can be instantiated', function () {
    $service = app(News\NewsWorkflowService::class);
    expect($service)->toBeInstanceOf(News\NewsWorkflowService::class);
});
