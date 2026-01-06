<?php

use App\Models\NewsWorkflowSetting;

test('can create NewsWorkflowSetting', function () {
    $model = NewsWorkflowSetting::factory()->create();
    expect($model)->toBeInstanceOf(NewsWorkflowSetting::class);
});

test('NewsWorkflowSetting has required attributes', function () {
    $model = NewsWorkflowSetting::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
