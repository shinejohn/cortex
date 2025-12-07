<?php

declare(strict_types=1);

use App\Http\Middleware\DetectAppDomain;
use App\Http\Middleware\DetectUserLocation;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\VerifyN8nApiKey;
use App\Http\Middleware\WorkspaceMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;
use Sentry\Laravel\Integration;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        using: function () {
            // DayNews domain routes (shared routes loaded first, then day-news routes with wildcard last)
            Route::domain(config('domains.day-news'))
                ->middleware('web')
                ->group(function () {
                    require base_path('routes/auth.php');
                    require base_path('routes/settings.php');
                    require base_path('routes/workspace.php');
                    require base_path('routes/day-news.php');
                });

            // DowntownGuide domain routes
            Route::domain(config('domains.downtown-guide'))
                ->middleware('web')
                ->group(base_path('routes/downtown-guide.php'));

            // GoEventCity domain routes (default - matches any other domain)
            Route::middleware('web')
                ->group(base_path('routes/web.php'));

            Route::middleware('web')
                ->group(base_path('routes/auth.php'));

            Route::middleware('web')
                ->group(base_path('routes/workspace.php'));

            Route::middleware('web')
                ->group(base_path('routes/settings.php'));
        },
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            'stripe/webhook',
            'api/n8n/*',
        ]);

        $middleware->web(append: [
            DetectAppDomain::class,
            DetectUserLocation::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            WorkspaceMiddleware::class,
        ]);

        $middleware->alias([
            'n8n.api' => VerifyN8nApiKey::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        if (config('app.observability.sentry.enabled')) {
            Integration::handles($exceptions);
        }
    })->create();
