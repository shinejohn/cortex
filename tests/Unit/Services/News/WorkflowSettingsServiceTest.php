<?php

use App\Services\News\WorkflowSettingsService;

test('WorkflowSettingsService can be instantiated', function () {
    $service = app(News\WorkflowSettingsService::class);
    expect($service)->toBeInstanceOf(News\WorkflowSettingsService::class);
});
