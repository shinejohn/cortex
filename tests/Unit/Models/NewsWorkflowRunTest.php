<?php

use App\Models\NewsWorkflowRun;

test('can create NewsWorkflowRun', function () {
    $model = NewsWorkflowRun::factory()->create();
    expect($model)->toBeInstanceOf(NewsWorkflowRun::class);
});

test('NewsWorkflowRun has required attributes', function () {
    $model = NewsWorkflowRun::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
