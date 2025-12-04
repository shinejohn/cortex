<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\GeocodingServiceInterface;
use App\Services\GeocodingService;
use Exception;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(GeocodingServiceInterface::class, GeocodingService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (! config('makerkit.auth.magiclink.enabled') && ! config('makerkit.auth.password.enabled')) {
            throw new Exception('Magic link or password authentication must be enabled');
        }

        $this->configureRateLimiting();
    }

    /**
     * Configure the rate limiters for the application.
     */
    private function configureRateLimiting(): void
    {
        // Rate limiter for geocoding jobs - Google Maps API allows 50 requests/second
        // We limit to 10 per second to be safe and avoid hitting API limits
        RateLimiter::for('geocoding', fn () => Limit::perSecond(10));
    }
}
