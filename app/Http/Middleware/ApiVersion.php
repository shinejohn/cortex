<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class ApiVersion
{
    /**
     * Handle an incoming request and set API version.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Extract version from route (e.g., /api/v1/...)
        $version = $request->segment(2) ?? 'v1';

        // Set version in request for use in controllers
        $request->attributes->set('api_version', $version);

        return $next($request);
    }
}


