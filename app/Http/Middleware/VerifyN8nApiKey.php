<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class VerifyN8nApiKey
{
    /**
     * Handle an incoming request.
     *
     * Verifies that the request contains a valid N8N API key in the
     * X-N8N-API-Key header or Authorization header (Bearer token).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = config('services.n8n.api_key');

        // If no API key is configured, allow the request (for local development)
        if (empty($apiKey)) {
            return $next($request);
        }

        // Check for API key in X-N8N-API-Key header (preferred)
        $providedKey = $request->header('X-N8N-API-Key');

        // Fallback to Authorization Bearer token
        if (empty($providedKey)) {
            $authHeader = $request->header('Authorization');
            if ($authHeader !== null && str_starts_with($authHeader, 'Bearer ')) {
                $providedKey = mb_substr($authHeader, 7);
            }
        }

        // Verify the API key matches
        if ($providedKey === null || ! hash_equals($apiKey, $providedKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Invalid or missing API key.',
            ], 401);
        }

        return $next($request);
    }
}
