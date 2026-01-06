<?php

use App\Http\Controllers\WorkspaceController;

test('WorkspaceController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\WorkspaceController"))->toBeTrue();
});
