<?php

declare(strict_types=1);

use App\Http\Middleware\DetectAppDomain;
use App\Http\Middleware\DetectUserLocation;
use App\Http\Middleware\DomainResolutionMiddleware;
use App\Http\Middleware\ForceHttps;
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
            // Health routes loaded WITHOUT middleware for maximum reliability
            // These must respond even when Redis/sessions/etc are unavailable
            require base_path('routes/health.php');

            // Shared routes loaded once globally (no domain restriction)
            // These routes are shared across all domains and should only be loaded once
            Route::middleware('web')->group(function () {
                require base_path('routes/auth.php');
                require base_path('routes/settings.php');
                require base_path('routes/workspace.php');
                require base_path('routes/email-tracking.php');
            });

            // API routes
            $apiDomain = config('domains.api');
            if ($apiDomain && $apiDomain !== 'api.day.news') {
                // Dedicated API Domain Mode
                Route::domain($apiDomain)
                    ->name('api.')
                    ->group(function () {
                        require base_path('routes/api.php');
                    });
            } else {
                // Legacy/Dev Mode (Global /api prefix on all domains)
                Route::prefix('api')->group(function () {
                    require base_path('routes/api.php');
                });
            }

            // DayNews domain routes (domain-specific routes only)
            Route::domain(config('domains.day-news'))
                ->middleware('web')
                ->name('daynews.')
                ->group(function () {
                    require base_path('routes/day-news.php');
                });

            // DowntownGuide domain routes
            $downtownGuideDomain = config('domains.downtown-guide');
            if ($downtownGuideDomain) {
                // Apex domain (matches config/env value exactly)
                // Note: routes/downtown-guide.php already has Route::name('downtown-guide.') group
                Route::domain($downtownGuideDomain)
                    ->middleware('web')
                    ->group(function () {
                        require base_path('routes/downtown-guide.php');
                    });

                // Subdomain support - add prefix to differentiate from apex
                Route::domain('{subdomain}.'.$downtownGuideDomain)
                    ->where(['subdomain' => '[a-z0-9-]*'])
                    ->middleware('web')
                    ->name('subdomain.') // Prefix subdomain routes to avoid name collision with apex domain
                    ->group(function () {
                        require base_path('routes/downtown-guide.php');
                    });
            }

            // Go Local Voices domain routes (domain-specific routes only)
            // Note: routes/local-voices.php already has 'localvoices.' prefix on each route
            Route::domain(config('domains.local-voices'))
                ->middleware('web')
                ->group(function () {
                    require base_path('routes/local-voices.php');
                });

            // Ads routes
            Route::middleware('web')
                ->group(function () {
                    require base_path('routes/ads.php');
                });

            // AlphaSite domain routes
            // Routes are domain-constrained in routes/alphasite.php (handles both .com and .ai domains)
            // No need to add domain constraints here as routes file handles them
            Route::middleware('web')
                ->group(function () {
                    require base_path('routes/alphasite.php');
                });

            // GoEventCity domain routes
            $eventCityDomain = config('domains.event-city');
            if ($eventCityDomain) {
                // Apex domain (matches config/env value exactly)
                // Note: routes/web.php does not have a top-level Route::name() group
                Route::domain($eventCityDomain)
                    ->middleware('web')
                    ->group(function () {
                        require base_path('routes/web.php');
                    });

                // Subdomain support - add prefix to differentiate from apex
                Route::domain('{subdomain}.'.$eventCityDomain)
                    ->where(['subdomain' => '[a-z0-9-]*'])
                    ->middleware('web')
                    ->name('subdomain.') // Prefix subdomain routes to avoid name collision with apex domain
                    ->group(function () {
                        require base_path('routes/web.php');
                    });
            }
        },
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust all proxies (AWS ALB, CloudFront, etc.)
        // In production behind a load balancer, we need to trust proxies to get correct client IP and protocol
        $middleware->trustProxies(at: '*');

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            'stripe/webhook',
            'api/n8n/*',
        ]);

        $middleware->web(append: [
            ForceHttps::class,
            DetectAppDomain::class,
            DetectUserLocation::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            WorkspaceMiddleware::class,
        ]);

        $middleware->alias([
            'n8n.api' => VerifyN8nApiKey::class,
            'domain.resolve' => DomainResolutionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Always enable Sentry if configured (even in production for error tracking)
        try {
            if (config('app.observability.sentry.enabled', false)) {
                Integration::handles($exceptions);
            }
        } catch (Throwable $e) {
            // Silently fail if Sentry config is broken - don't break the app
        }

        // Handle Redis/Predis connection errors gracefully
        $exceptions->render(function (Predis\Connection\ConnectionException|RedisException|Illuminate\Redis\Connections\ConnectionException $e, Illuminate\Http\Request $request) {
            Illuminate\Support\Facades\Log::warning('Redis connection error - falling back to database cache', [
                'error' => $e->getMessage(),
                'url' => $request->fullUrl(),
                'type' => get_class($e),
            ]);

            // Don't return an error - let the request continue
            // Individual cache operations should handle Redis failures with try-catch
            return null;
        });

        // Handle config errors gracefully (like scribe.php issues)
        $exceptions->render(function (Error|ParseError|TypeError $e, Illuminate\Http\Request $request) {
            // Log the error but don't expose details in production
            Illuminate\Support\Facades\Log::error('Configuration error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Configuration error. Please contact support.',
                ], 500);
            }

            // Try to show a generic error page
            if (view()->exists('errors.500')) {
                return response()->view('errors.500', [], 500);
            }

            return response('Internal Server Error', 500);
        });

        // Log all exceptions for debugging (only in non-production or when debug is enabled)
        $appDebug = env('APP_DEBUG', false);
        $appEnv = env('APP_ENV', 'production');

        if ($appDebug || $appEnv !== 'production') {
            $exceptions->report(function (Throwable $e) {
                Illuminate\Support\Facades\Log::error('Exception occurred', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => mb_substr($e->getTraceAsString(), 0, 1000), // Limit trace length
                ]);
            });
        } else {
            // In production, still log errors but don't expose details
            $exceptions->report(function (Throwable $e) {
                Illuminate\Support\Facades\Log::error('Exception occurred in production', [
                    'message' => $e->getMessage(),
                    'file' => basename($e->getFile()),
                    'line' => $e->getLine(),
                ]);
            });
        }
    })->create();
