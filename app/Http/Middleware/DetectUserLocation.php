<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\LocationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class DetectUserLocation
{
    public function __construct(
        private readonly LocationService $locationService
    ) {}

    /**
     * Handle an incoming request and detect user's location
     */
    public function handle(Request $request, Closure $next): Response
    {
        $region = $this->locationService->detectUserRegion();

        $request->attributes->set('detected_region', $region);

        config([
            'app.current_region' => $region,
        ]);

        return $next($request);
    }
}
