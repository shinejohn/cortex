<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\GeocodingServiceInterface;
use App\Services\GeocodingService;
use Exception;
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
    }
}
