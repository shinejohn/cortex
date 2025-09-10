<?php

declare(strict_types=1);

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\WorkspaceSettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$magicLinkEnabled = config('makerkit.auth.magiclink.enabled');
$passwordEnabled = config('makerkit.auth.password.enabled');

Route::middleware('auth')->group(function () use ($passwordEnabled) {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    if ($passwordEnabled) {
        Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
        Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');
    }

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // Workspace settings routes
    Route::get('settings/workspace', [WorkspaceSettingsController::class, 'showOverview'])->name('settings.workspace');
    Route::get('settings/workspace/members', [WorkspaceSettingsController::class, 'showMembers'])->name('settings.workspace.members');
    Route::patch('settings/workspace', [WorkspaceSettingsController::class, 'update'])->name('settings.workspace.update');
    Route::post('settings/workspace/invite', [WorkspaceSettingsController::class, 'inviteUser'])->name('settings.workspace.invite');
    Route::patch('settings/workspace/members/{membership}', [WorkspaceSettingsController::class, 'updateMemberRole'])->name('settings.workspace.members.update');
    Route::delete('settings/workspace/members/{membership}', [WorkspaceSettingsController::class, 'removeMember'])->name('settings.workspace.members.remove');
    Route::delete('settings/workspace/invitations/{invitation}', [WorkspaceSettingsController::class, 'cancelInvitation'])->name('settings.workspace.invitations.cancel');
});
