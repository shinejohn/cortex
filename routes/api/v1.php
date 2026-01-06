<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
|
| All API v1 routes are defined here. Routes are organized by category
| and follow RESTful conventions.
|
*/

// Public routes (no authentication required)
Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'message' => 'API v1 is healthy',
            'version' => '1.0.0',
        ]);
    });

    // Authentication routes (public)
    if (file_exists(__DIR__.'/v1/auth.php')) {
        require __DIR__.'/v1/auth.php';
    }

    // Public content routes
    if (file_exists(__DIR__.'/v1/public.php')) {
        require __DIR__.'/v1/public.php';
    }
});

// Authenticated routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // User routes
    if (file_exists(__DIR__.'/v1/users.php')) {
        require __DIR__.'/v1/users.php';
    }

    // Workspace routes
    if (file_exists(__DIR__.'/v1/workspaces.php')) {
        require __DIR__.'/v1/workspaces.php';
    }

    // Tenant routes (CRM)
    if (file_exists(__DIR__.'/v1/tenants.php')) {
        require __DIR__.'/v1/tenants.php';
    }

    // Publishing routes
    $publishingRoutes = [
        'posts', 'news-articles', 'events', 'venues', 'performers',
        'businesses', 'tags', 'comments', 'announcements', 'classifieds',
        'coupons', 'photos', 'podcasts', 'legal-notices', 'memorials',
    ];

    foreach ($publishingRoutes as $route) {
        $file = __DIR__.'/v1/'.$route.'.php';
        if (file_exists($file)) {
            require $file;
        }
    }

    // CRM routes
    if (file_exists(__DIR__.'/v1/crm.php')) {
        require __DIR__.'/v1/crm.php';
    }

    // Social routes
    if (file_exists(__DIR__.'/v1/social.php')) {
        require __DIR__.'/v1/social.php';
    }

    // Community routes
    if (file_exists(__DIR__.'/v1/communities.php')) {
        require __DIR__.'/v1/communities.php';
    }

    // Messaging routes
    if (file_exists(__DIR__.'/v1/messaging.php')) {
        require __DIR__.'/v1/messaging.php';
    }

    // Notification routes
    if (file_exists(__DIR__.'/v1/notifications.php')) {
        require __DIR__.'/v1/notifications.php';
    }

    // Ticketing routes
    if (file_exists(__DIR__.'/v1/tickets.php')) {
        require __DIR__.'/v1/tickets.php';
    }

    // E-commerce routes
    if (file_exists(__DIR__.'/v1/stores.php')) {
        require __DIR__.'/v1/stores.php';
    }
    if (file_exists(__DIR__.'/v1/carts.php')) {
        require __DIR__.'/v1/carts.php';
    }

    // Calendar routes
    if (file_exists(__DIR__.'/v1/calendars.php')) {
        require __DIR__.'/v1/calendars.php';
    }

    // Hub routes
    if (file_exists(__DIR__.'/v1/hubs.php')) {
        require __DIR__.'/v1/hubs.php';
    }

    // Region routes
    if (file_exists(__DIR__.'/v1/regions.php')) {
        require __DIR__.'/v1/regions.php';
    }

    // Advertising routes
    if (file_exists(__DIR__.'/v1/advertisements.php')) {
        require __DIR__.'/v1/advertisements.php';
    }

    // Email marketing routes
    if (file_exists(__DIR__.'/v1/email-campaigns.php')) {
        require __DIR__.'/v1/email-campaigns.php';
    }

    // Emergency routes
    if (file_exists(__DIR__.'/v1/emergency-alerts.php')) {
        require __DIR__.'/v1/emergency-alerts.php';
    }

    // Search routes
    if (file_exists(__DIR__.'/v1/search.php')) {
        require __DIR__.'/v1/search.php';
    }

    // RSS routes
    if (file_exists(__DIR__.'/v1/rss.php')) {
        require __DIR__.'/v1/rss.php';
    }

    // Review & Rating routes
    if (file_exists(__DIR__.'/v1/reviews.php')) {
        require __DIR__.'/v1/reviews.php';
    }

    // Organization routes
    if (file_exists(__DIR__.'/v1/organizations.php')) {
        require __DIR__.'/v1/organizations.php';
    }
});

