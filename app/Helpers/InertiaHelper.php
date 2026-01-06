<?php

declare(strict_types=1);

namespace App\Helpers;

class InertiaHelper
{
    /**
     * Get the correct Inertia component path based on current domain/platform
     */
    public static function componentPath(string $component): string
    {
        // If component already has platform prefix, return as-is
        if (str_contains($component, '/')) {
            $parts = explode('/', $component, 2);
            $platformPrefixes = ['event-city', 'day-news', 'downtown-guide', 'alphasite', 'local-voices'];
            
            if (in_array($parts[0], $platformPrefixes)) {
                return $component;
            }
        }
        
        // Determine platform from current domain or config
        $platform = config('app.current_domain', 'event-city');
        
        // Map domains to platform prefixes
        $domainMap = [
            'day-news' => 'day-news',
            'downtown-guide' => 'downtown-guide',
            'local-voices' => 'local-voices',
            'alphasite' => 'alphasite',
        ];
        
        $platformPrefix = $domainMap[$platform] ?? 'event-city';
        
        return "{$platformPrefix}/{$component}";
    }
}

