<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\Civic\CivicPlusService;
use App\Services\Civic\CivicSourceCollectionService;
use App\Services\Civic\LegistarService;
use App\Services\Civic\NixleService;
use Illuminate\Support\ServiceProvider;

class CivicSourcesServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Merge config
        $this->mergeConfigFrom(
            __DIR__ . '/../../config/civic-sources.php',
            'civic-sources'
        );

        // Register platform services as singletons
        $this->app->singleton(LegistarService::class, function ($app) {
            return new LegistarService();
        });

        $this->app->singleton(CivicPlusService::class, function ($app) {
            return new CivicPlusService();
        });

        $this->app->singleton(NixleService::class, function ($app) {
            return new NixleService();
        });

        // Register main collection service
        $this->app->singleton(CivicSourceCollectionService::class, function ($app) {
            return new CivicSourceCollectionService(
                $app->make(LegistarService::class),
                $app->make(CivicPlusService::class),
                $app->make(NixleService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publish config
        $this->publishes([
            __DIR__ . '/../../config/civic-sources.php' => config_path('civic-sources.php'),
        ], 'civic-sources-config');

        // Publish migrations
        $this->publishes([
            __DIR__ . '/../../database/migrations/' => database_path('migrations'),
        ], 'civic-sources-migrations');

        // Register commands
        if ($this->app->runningInConsole()) {
            $this->commands([
                \App\Console\Commands\ManageCivicSources::class,
            ]);
        }
    }
}
