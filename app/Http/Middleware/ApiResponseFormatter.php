<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class ApiResponseFormatter
{
    /**
     * Handle an incoming request and format API responses.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only format JSON responses
        if ($response instanceof JsonResponse) {
            $data = $response->getData(true);

            // If response doesn't have 'success' key, wrap it
            if (!isset($data['success'])) {
                $response->setData([
                    'success' => $response->getStatusCode() < 400,
                    'data' => $data,
                ]);
            }
        }

        return $response;
    }
}


