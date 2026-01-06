<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\WorkspaceController;
use App\Http\Controllers\Api\V1\WorkspaceMemberController;
use App\Http\Controllers\Api\V1\WorkspaceInvitationController;
use Illuminate\Support\Facades\Route;

Route::prefix('workspaces')->group(function () {
    Route::get('/', [WorkspaceController::class, 'index']);
    Route::get('/{workspace}', [WorkspaceController::class, 'show']);
    Route::post('/', [WorkspaceController::class, 'store']);
    Route::put('/{workspace}', [WorkspaceController::class, 'update']);
    Route::delete('/{workspace}', [WorkspaceController::class, 'destroy']);

    Route::prefix('{workspace}/members')->group(function () {
        Route::get('/', [WorkspaceMemberController::class, 'index']);
        Route::post('/', [WorkspaceMemberController::class, 'store']);
        Route::put('/{userId}', [WorkspaceMemberController::class, 'update']);
        Route::delete('/{userId}', [WorkspaceMemberController::class, 'destroy']);
    });

    Route::prefix('{workspace}/invitations')->group(function () {
        Route::get('/', [WorkspaceInvitationController::class, 'index']);
        Route::post('/', [WorkspaceInvitationController::class, 'store']);
    });
});

Route::prefix('invitations')->group(function () {
    Route::post('/{token}/accept', [WorkspaceInvitationController::class, 'accept']);
    Route::delete('/{invitation}', [WorkspaceInvitationController::class, 'destroy']);
});


