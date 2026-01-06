<?php

use App\Models\WorkspaceInvitation;

test('can create WorkspaceInvitation', function () {
    $model = WorkspaceInvitation::factory()->create();
    expect($model)->toBeInstanceOf(WorkspaceInvitation::class);
});

test('WorkspaceInvitation has required attributes', function () {
    $model = WorkspaceInvitation::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
