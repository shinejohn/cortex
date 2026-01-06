<?php

use App\Models\WorkspaceMembership;

test('can create WorkspaceMembership', function () {
    $model = WorkspaceMembership::factory()->create();
    expect($model)->toBeInstanceOf(WorkspaceMembership::class);
});

test('WorkspaceMembership has required attributes', function () {
    $model = WorkspaceMembership::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
