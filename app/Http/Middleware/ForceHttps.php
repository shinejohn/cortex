<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class ForceHttps
{
    /**
     * Handle an incoming request and force HTTPS if enabled.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if we're behind a proxy (like AWS ALB)
        // AWS ALB sets X-Forwarded-Proto header
        $isHttps = $request->header('X-Forwarded-Proto') === 'https' || 
                   $request->header('X-Forwarded-Ssl') === 'on' ||
                   $request->header('X-Forwarded-Port') === '443' ||
                   $request->server->get('HTTPS') === 'on' ||
                   $request->server->get('SERVER_PORT') == 443;
        
        if ($isHttps) {
            // Trust the proxy and set the request as secure
            $request->server->set('HTTPS', 'on');
            $request->server->set('SERVER_PORT', 443);
        }
        
        // Only force HTTPS redirect in production or if explicitly enabled
        $appEnv = config('app.env', 'production');
        $forceHttps = config('app.force_https', $appEnv === 'production');
        
        // Check if request is secure (either directly or via proxy headers)
        $requestIsSecure = $request->secure() || $isHttps;
        
        if ($forceHttps && !$requestIsSecure && !$request->is('healthcheck', 'up', 'health')) {
            // Redirect to HTTPS
            $url = $request->getRequestUri();
            $host = $request->getHost();
            return redirect()->secure($url, 301);
        }

        return $next($request);
    }
}

