<?php

declare(strict_types=1);

use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\OrganizationRelationshipController;
use App\Http\Middleware\ApiResponseFormatter;
use App\Http\Middleware\ApiVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| API routes are versioned and organized by version. All routes use
| the ApiVersion and ApiResponseFormatter middleware for consistent
| versioning and response formatting.
|
*/

Route::middleware([ApiVersion::class, ApiResponseFormatter::class])->group(function () {
    // API v1 routes
    require __DIR__.'/api/v1.php';

    // Legacy routes (maintain backward compatibility)
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');

    // Legacy Organization Routes (will be migrated to v1)
    Route::prefix('organizations')->group(function () {
        Route::get('/search', [OrganizationController::class, 'search']);
        Route::get('/{organization}/content', [OrganizationController::class, 'getContent']);
        Route::post('/{organization}/relate', [OrganizationController::class, 'relate']);
        Route::get('/{organization}/hierarchy', [OrganizationController::class, 'hierarchy']);
    });

    // Legacy Organization Relationship Routes
    Route::prefix('organization-relationships')->group(function () {
        Route::post('/', [OrganizationRelationshipController::class, 'store']);
        Route::post('/bulk', [OrganizationRelationshipController::class, 'bulkStore']);
        Route::put('/{relationship}', [OrganizationRelationshipController::class, 'update']);
        Route::delete('/{relationship}', [OrganizationRelationshipController::class, 'destroy']);
    });

    // Legacy Notification Routes (will be migrated to v1)
    Route::prefix('notifications')->group(function () {
        // Public endpoints
        Route::get('vapid-key', [NotificationController::class, 'getVapidKey']);

        // Authenticated endpoints
        Route::middleware('auth:sanctum')->group(function () {
            // Web Push
            Route::post('web-push/register', [NotificationController::class, 'registerWebPush']);

            // SMS
            Route::post('sms/request-verification', [NotificationController::class, 'requestPhoneVerification']);
            Route::post('sms/verify-and-subscribe', [NotificationController::class, 'verifyPhoneAndSubscribe']);

            // Management
            Route::get('subscriptions', [NotificationController::class, 'getSubscriptions']);
            Route::patch('subscriptions/{subscription}', [NotificationController::class, 'updatePreferences']);
            Route::delete('subscriptions/{subscription}', [NotificationController::class, 'unsubscribe']);
        });
    });
});
