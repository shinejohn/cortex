<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

$magicLinkEnabled = config('makerkit.auth.magiclink.enabled');
$passwordEnabled = config('makerkit.auth.password.enabled');

Route::middleware('guest')->group(function () use ($passwordEnabled, $magicLinkEnabled) {
    if ($passwordEnabled) {
        Route::get('register', [RegisteredUserController::class, 'create'])
            ->name('register');

        Route::post('register', [RegisteredUserController::class, 'store']);

        Route::post('login', [AuthenticatedSessionController::class, 'store']);

        Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
            ->name('password.email');

        Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
            ->name('password.reset');

        Route::post('reset-password', [NewPasswordController::class, 'store'])
            ->name('password.store');
    }

    Route::get('login', [AuthenticatedSessionController::class, $passwordEnabled ? 'create' : 'createMagicLink'])
        ->name('login');

    if (! $passwordEnabled) {
        Route::get('register', [AuthenticatedSessionController::class, 'createMagicLink'])
            ->name('register');
    }

    if ($magicLinkEnabled && $passwordEnabled) {
        Route::get('magiclink', [AuthenticatedSessionController::class, 'createMagicLink'])
            ->name('magiclink');
    }

    if ($magicLinkEnabled) {
        Route::post('magiclink', [AuthenticatedSessionController::class, 'generateMagicLink'])
            ->name('magiclink.generate');
    }
});

// Magic link callback route (needs to be outside guest middleware since user will be authenticated)
Route::get('auth/magic-link/callback', [AuthenticatedSessionController::class, 'magicLinkCallback'])
    ->name('auth.magic-link.callback');

// Needed to be outside of the middleware group so both authenticated and unauthenticated users can access it
if ($passwordEnabled) {
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');
}

// Email verification and password confirmation routes
Route::middleware('auth')->group(function () use ($passwordEnabled) {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    if ($passwordEnabled) {
        Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
            ->name('password.confirm');

        Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);
    }

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

// Socialite Routes
Route::group(['prefix' => 'auth'], function () {
    Route::get('{provider}/redirect', [SocialiteController::class, 'redirect'])
        ->name('auth.socialite.redirect');

    Route::get('{provider}/callback', [SocialiteController::class, 'callback'])
        ->name('auth.socialite.callback');
});
