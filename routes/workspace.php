<?php

declare(strict_types=1);

use App\Http\Controllers\WorkspaceController;
use Illuminate\Support\Facades\Route;

Route::get('invitation/{token}', [WorkspaceController::class, 'showInvitation'])->middleware('throttle:5,1')->name('workspace.invitation.accept');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('workspaces', [WorkspaceController::class, 'store'])->name('workspaces.store');
    Route::post('workspaces/switch', [WorkspaceController::class, 'switch'])->name('workspaces.switch');
});
