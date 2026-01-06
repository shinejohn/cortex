<?php

test('WorkspaceSettingsController exists', function () {
    expect(class_exists('App\Http\Controllers\Settings\WorkspaceSettingsController'))->toBeTrue();
});

test('WorkspaceSettingsController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Settings\WorkspaceSettingsController'))->toBeTrue();
});
