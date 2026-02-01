<?php

declare(strict_types=1);

use App\Http\Middleware\DetectAppDomain;
use App\Http\Middleware\DetectUserLocation;
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
                    require base_path('routes/email-tracking.php');
                    require base_path('routes/day-news.php');
                });

            // DowntownGuide domain routes
            // Register routes for downtown-guide domain, with fallback pattern matching
            $downtownGuideDomain = config('domains.downtown-guide');
            // #region agent log
            file_put_contents('/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/.cursor/debug.log', json_encode(['location'=>'bootstrap/app.php:41','message'=>'DowntownGuide domain config loaded','data'=>['domain'=>$downtownGuideDomain],'timestamp'=>time()*1000,'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'A'])."\n", FILE_APPEND);
            // #endregion
            
            // Always register routes for downtownsguide.com patterns (handles dev.downtownsguide.com, www.downtownsguide.com, etc.)
            Route::domain('{subdomain}.downtownsguide.com')
                ->where(['subdomain' => '[a-z0-9-]+'])
                ->middleware('web')
                ->group(function () {
                    // #region agent log
                    file_put_contents('/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/.cursor/debug.log', json_encode(['location'=>'bootstrap/app.php:47','message'=>'Subdomain route matched','data'=>['pattern'=>'{subdomain}.downtownsguide.com'],'timestamp'=>time()*1000,'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'A'])."\n", FILE_APPEND);
                    // #endregion
                    require base_path('routes/email-tracking.php');
                    require base_path('routes/downtown-guide.php');
                });
            
            Route::domain('downtownsguide.com')
                ->middleware('web')
                ->group(function () {
                    // #region agent log
                    file_put_contents('/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/.cursor/debug.log', json_encode(['location'=>'bootstrap/app.php:54','message'=>'Main domain route matched','data'=>['pattern'=>'downtownsguide.com'],'timestamp'=>time()*1000,'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'A'])."\n", FILE_APPEND);
                    // #endregion
                    require base_path('routes/email-tracking.php');
                    require base_path('routes/downtown-guide.php');
                });
            
            // Also register with configured domain if it's different from downtownsguide.com
            if ($downtownGuideDomain && $downtownGuideDomain !== 'downtownsguide.com' && !str_ends_with($downtownGuideDomain, '.downtownsguide.com')) {
                Route::domain($downtownGuideDomain)
                    ->middleware('web')
                    ->group(function () use ($downtownGuideDomain) {
                        // #region agent log
                        file_put_contents('/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/.cursor/debug.log', json_encode(['location'=>'bootstrap/app.php:73','message'=>'Custom domain route matched','data'=>['domain'=>$downtownGuideDomain],'timestamp'=>time()*1000,'sessionId'=>'debug-session','runId'=>'run2','hypothesisId'=>'A'])."\n", FILE_APPEND);
                        // #endregion
                        require base_path('routes/email-tracking.php');
                        require base_path('routes/downtown-guide.php');
                    });
            }

            // Go Local Voices domain routes (standalone)
            Route::domain(config('domains.local-voices'))
                ->middleware('web')
                ->name('localvoices.')
                ->group(function () {
                    require base_path('routes/auth.php');
                    require base_path('routes/settings.php');
                    require base_path('routes/email-tracking.php');
                    require base_path('routes/local-voices.php');
                });

            // AlphaSite domain routes
            // Routes are domain-constrained in routes/alphasite.php (handles both .com and .ai domains)
            // No need to add domain constraints here as routes file handles them
            Route::middleware('web')
                ->group(function () {
                    require base_path('routes/email-tracking.php');
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
                    require base_path('routes/email-tracking.php');
                    require base_path('routes/web.php');
                });
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
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Always enable Sentry if configured (even in production for error tracking)
        try {
            if (config('app.observability.sentry.enabled', false)) {
                Integration::handles($exceptions);
            }
        } catch (\Throwable $e) {
            // Silently fail if Sentry config is broken - don't break the app
        }

        // Handle Redis/Predis connection errors gracefully
        $exceptions->render(function (\Predis\Connection\ConnectionException | \RedisException | \Illuminate\Redis\Connections\ConnectionException $e, \Illuminate\Http\Request $request) {
            \Illuminate\Support\Facades\Log::warning('Redis connection error - falling back to database cache', [
                'error' => $e->getMessage(),
                'url' => $request->fullUrl(),
                'type' => get_class($e),
            ]);

            // Don't return an error - let the request continue
            // Individual cache operations should handle Redis failures with try-catch
            return null;
        });

        // Handle config errors gracefully (like scribe.php issues)
        $exceptions->render(function (\Error | \ParseError | \TypeError $e, \Illuminate\Http\Request $request) {
            // Log the error but don't expose details in production
            \Illuminate\Support\Facades\Log::error('Configuration error', [
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
            $exceptions->report(function (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Exception occurred', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => substr($e->getTraceAsString(), 0, 1000), // Limit trace length
                ]);
            });
        } else {
            // In production, still log errors but don't expose details
            $exceptions->report(function (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Exception occurred in production', [
                    'message' => $e->getMessage(),
                    'file' => basename($e->getFile()),
                    'line' => $e->getLine(),
                ]);
            });
        }
    })->create();

// include ads routes once (fix duplicate route names for route caching)
require base_path('routes/ads.php');
