<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class DetectAppDomain
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Only trust X-Forced-Host in local/testing environments to prevent cache poisoning
            $host = (config('app.env') === 'local' || config('app.env') === 'testing')
                ? ($request->header('X-Forced-Host') ?? $request->getHost())
                : $request->getHost();

            // Detect the app based on configured domain
            // Check for exact match first, then check if host contains the domain name
            // Use try-catch to handle config errors gracefully
            $dayNewsDomain = null;
            $downtownGuideDomain = null;
            $eventCityDomain = null;
            $alphaSiteDomain = null;
            $localVoicesDomain = null;
            
            try {
                $dayNewsDomain = config('domains.day-news');
                $downtownGuideDomain = config('domains.downtown-guide');
                $eventCityDomain = config('domains.event-city');
                $alphaSiteDomain = config('domains.alphasite');
                $localVoicesDomain = config('domains.local-voices');
            } catch (\Throwable $e) {
                // If config fails, fall back to hostname pattern matching
                \Illuminate\Support\Facades\Log::warning('Failed to load domain config, using hostname patterns', [
                    'error' => $e->getMessage(),
                ]);
            }

            $appType = match (true) {
                // Day News detection - check exact match first, then hostname patterns
                $dayNewsDomain && $host === $dayNewsDomain => 'day-news',
                str_contains($host, 'daynews') || str_contains($host, 'day.news') => 'day-news',
                
                // Downtown Guide detection - check exact match first, then hostname patterns
                $downtownGuideDomain && $host === $downtownGuideDomain => 'downtown-guide',
                str_contains($host, 'downtownsguide') || str_contains($host, 'downtown-guide') => 'downtown-guide',
                
                // AlphaSite detection - check exact match first, then hostname patterns
                $alphaSiteDomain && $host === $alphaSiteDomain => 'alphasite',
                str_contains($host, 'alphasite') => 'alphasite',
                
                // Local Voices detection - check exact match first, then hostname patterns
                $localVoicesDomain && $host === $localVoicesDomain => 'local-voices',
                str_contains($host, 'golocalvoices') || str_contains($host, 'local-voices') => 'local-voices',
                
                // Event City detection - check exact match first, then hostname patterns
                $eventCityDomain && $host === $eventCityDomain => 'event-city',
                str_contains($host, 'goeventcity') || str_contains($host, 'event-city') => 'event-city',
                
                default => 'event-city', // Default to event-city for any unmatched domain
            };

            // Store in config for use throughout the application
            try {
                config(['app.current_domain' => $appType]);
                
                // Set site-specific Redis prefix to prevent cache collisions between sites
                // This ensures each site has isolated Redis keys
                // Note: Redis prefix is applied at connection time, so existing connections
                // will continue using old prefix until reconnected. New connections will use new prefix.
                $redisPrefix = $appType . '_database_';
                config(['database.redis.options.prefix' => $redisPrefix]);
                
                // Set site-specific cache prefix (applied immediately to cache operations)
                $cachePrefix = $appType . '_cache_';
                config(['cache.prefix' => $cachePrefix]);
                
                // Set site-specific session cookie name to prevent session collisions
                $sessionCookie = $appType . '_session';
                config(['session.cookie' => $sessionCookie]);
                
            } catch (\Throwable $e) {
                // Log but don't fail - fallback to defaults
                \Illuminate\Support\Facades\Log::warning('Failed to set site-specific config', [
                    'error' => $e->getMessage(),
                    'app_type' => $appType,
                ]);
            }

            // Also store in request for easy access
            $request->attributes->set('app_domain', $appType);

            return $next($request);
        } catch (\Throwable $e) {
            // If anything fails, log and continue with default
            \Illuminate\Support\Facades\Log::error('DetectAppDomain middleware error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            
            $request->attributes->set('app_domain', 'event-city');
            return $next($request);
        }
    }
}
