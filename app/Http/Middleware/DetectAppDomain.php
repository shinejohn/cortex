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
        $host = $request->getHost();

        // Detect the app based on configured domain
        $appType = match ($host) {
            config('domains.day-news') => 'day-news',
            config('domains.downtown-guide') => 'downtown-guide',
            config('domains.event-city') => 'event-city',
            default => 'event-city', // Default to event-city for any unmatched domain
        };

        // Store in config for use throughout the application
        config(['app.current_domain' => $appType]);

        // Also store in request for easy access
        $request->attributes->set('app_domain', $appType);

        return $next($request);
    }
}
