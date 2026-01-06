<?php

use App\Services\Workspace\WorkspaceInvitationService;

test('WorkspaceInvitationService can be instantiated', function () {
    $service = app(App\Services\Workspace\WorkspaceInvitationService::class);
    expect($service)->toBeInstanceOf(App\Services\Workspace\WorkspaceInvitationService::class);
});
