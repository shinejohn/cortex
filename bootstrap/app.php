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
            // API routes (no domain restriction)
            Route::prefix('api')->group(function () {
                require base_path('routes/api.php');
            });

            // DayNews domain routes (shared routes loaded first, then day-news routes with wildcard last)
            Route::domain(config('domains.day-news'))
                ->middleware('web')
                ->name('daynews.')
                ->group(function () {
                    require base_path('routes/auth.php');
                    require base_path('routes/settings.php');
                    require base_path('routes/workspace.php');
                    require base_path('routes/ads.php');
                    require base_path('routes/email-tracking.php');
                    require base_path('routes/admin.php');
                    require base_path('routes/day-news.php');
                });

            // DowntownGuide domain routes
            Route::domain(config('domains.downtown-guide'))
                ->middleware('web')
                ->group(function () {
                    require base_path('routes/ads.php');
                    require base_path('routes/email-tracking.php');
                    require base_path('routes/admin.php');
                    require base_path('routes/downtown-guide.php');
                });

            // Go Local Voices domain routes (standalone)
            Route::domain(config('domains.local-voices'))
                ->middleware('web')
                ->name('localvoices.')
                ->group(function () {
                    require base_path('routes/auth.php');
                    require base_path('routes/settings.php');
                    require base_path('routes/ads.php');
                    require base_path('routes/email-tracking.php');
                    require base_path('routes/admin.php');
                    require base_path('routes/local-voices.php');
                });

            // AlphaSite domain routes (subdomain and main domain)
            Route::middleware('web')
                ->group(function () {
                    require base_path('routes/ads.php');
                    require base_path('routes/email-tracking.php');
                    require base_path('routes/admin.php');
                    require base_path('routes/alphasite.php');
                });

            // GoEventCity domain routes (fallback - no domain constraint, matches any domain not matched above)
            Route::middleware('web')
                ->group(function () {
                    // Health check routes (no domain restriction)
                    require base_path('routes/health.php');
                    require base_path('routes/auth.php');
                    require base_path('routes/settings.php');
                    require base_path('routes/workspace.php');
                    require base_path('routes/ads.php');
                    require base_path('routes/email-tracking.php');
                    require base_path('routes/admin.php');
                    require base_path('routes/web.php');
                });
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

        // Handle Redis/Predis connection errors gracefully
        $exceptions->render(function (\Predis\Connection\ConnectionException | \RedisException | \Illuminate\Redis\Connections\ConnectionException $e, \Illuminate\Http\Request $request) {
            \Illuminate\Support\Facades\Log::error('Redis connection error', [
                'error' => $e->getMessage(),
                'url' => $request->fullUrl(),
                'type' => get_class($e),
            ]);

            // Return a user-friendly error instead of crashing
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Service temporarily unavailable. Please try again.',
                    'message' => 'Redis connection failed. Please check your Redis configuration.',
                ], 503);
            }

            // Try to render 503 error page, fallback to simple message
            if (view()->exists('errors.503')) {
                return response()->view('errors.503', [
                    'message' => 'Service temporarily unavailable. Please try again.',
                ], 503);
            }

            return response('Service temporarily unavailable. Please try again.', 503);
        });

        // Log all exceptions for debugging (only in non-production or when debug is enabled)
        if (config('app.debug') || config('app.env') !== 'production') {
            $exceptions->report(function (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Exception occurred', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => substr($e->getTraceAsString(), 0, 1000), // Limit trace length
                ]);
            });
        }
    })->create();
