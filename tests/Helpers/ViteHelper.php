<?php

declare(strict_types=1);

namespace Tests\Helpers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Vite;

/**
 * Helper to mock Vite manifest for tests
 */
class ViteHelper
{
    /**
     * Create a fake Vite manifest for testing
     */
    public static function createFakeManifest(): void
    {
        // Laravel Vite looks for manifest in public/build/.vite/manifest.json
        // or public/build/manifest.json depending on Laravel version
        $possiblePaths = [
            public_path('build/.vite/manifest.json'),
            public_path('build/manifest.json'),
        ];

        $manifestPath = $possiblePaths[0];
        $manifestDir = dirname($manifestPath);

        // Create directory if it doesn't exist
        if (!File::exists($manifestDir)) {
            File::makeDirectory($manifestDir, 0755, true);
        }

        // Also create the alternative path directory
        $altDir = dirname($possiblePaths[1]);
        if (!File::exists($altDir)) {
            File::makeDirectory($altDir, 0755, true);
        }

        // Create a minimal manifest that includes common assets
        $manifest = [
            'resources/js/app.tsx' => [
                'file' => 'assets/app.js',
                'src' => 'resources/js/app.tsx',
                'isEntry' => true,
            ],
            'resources/css/app.css' => [
                'file' => 'assets/app.css',
                'src' => 'resources/css/app.css',
            ],
        ];

        // Add common page components that tests might hit
        // Comprehensive list based on test failures and common routes
        $commonPages = [
            'event-city/tickets/listing-show',
            'event-city/tickets/my-tickets',
            'event-city/tickets/index',
            'event-city/events/index',
            'event-city/events/show',
            'event-city/calendar/index',
            'event-city/hubs/index',
            'event-city/hubs/show',
            'event-city/check-in/index',
            'event-city/stores/index',
            'event-city/stores/show',
            'event-city/regions/index',
            'event-city/social/groups/index',
            'event-city/promo-codes/index',
            'event-city/promo-codes/show',
            'event-city/social/messages-index',
            'event-city/social/messages-new',
            'event-city/notifications/index',
            'event-city/calendars',
            'event-city/calendars/index',
            'event-city/calendars/show',
            'event-city/calendars/edit',
            'event-city/calendars/create',
            'event-city/stores/edit',
            'event-city/products/create',
            'event-city/settings/workspace/overview',
        ];

        foreach ($commonPages as $page) {
            $manifest["resources/js/pages/{$page}.tsx"] = [
                'file' => "assets/{$page}.js",
                'src' => "resources/js/pages/{$page}.tsx",
                'isEntry' => true,
            ];
        }

        // Write to both possible locations
        File::put($manifestPath, json_encode($manifest, JSON_PRETTY_PRINT));
        File::put($possiblePaths[1], json_encode($manifest, JSON_PRETTY_PRINT));
    }

    /**
     * Mock Vite facade to return empty strings in tests
     */
    public static function mockVite(): void
    {
        // This will be handled by creating the manifest file instead
        // Laravel's Vite helper will use the manifest if it exists
    }
}

