<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\GeocodingServiceInterface;
use App\Models\User;
use App\Services\GeocodingService;
use Exception;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Throwable;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Existing bindings
        $this->app->bind(GeocodingServiceInterface::class, GeocodingService::class);

        // Register AlphaSite services
        $this->app->singleton(\App\Services\AlphaSite\CommunityService::class);
        $this->app->singleton(\App\Services\AlphaSite\LinkingService::class);
        $this->app->singleton(\App\Services\AlphaSite\PageGeneratorService::class);
        $this->app->singleton(\App\Services\AlphaSite\SMBCrmService::class);
        $this->app->singleton(\App\Services\AlphaSite\SubscriptionLifecycleService::class);
        $this->app->singleton(\App\Services\AlphaSite\TemplateService::class);

        // Register DayNews services
        $this->app->singleton(\App\Services\DayNews\AnnouncementService::class);
        $this->app->singleton(\App\Services\DayNews\ArchiveService::class);
        $this->app->singleton(\App\Services\DayNews\AuthorService::class);
        $this->app->singleton(\App\Services\DayNews\ClassifiedService::class);
        $this->app->singleton(\App\Services\DayNews\PhotoService::class);
        $this->app->singleton(\App\Services\DayNews\PodcastService::class);
        $this->app->singleton(\App\Services\DayNews\SearchService::class);
        $this->app->singleton(\App\Services\DayNews\TagService::class);
        $this->app->singleton(\App\Services\DayNews\TrendingService::class);

        // Register News workflow services
        $this->app->singleton(\App\Services\News\ArticleGenerationService::class);
        $this->app->singleton(\App\Services\News\BusinessDiscoveryService::class);
        $this->app->singleton(\App\Services\News\ContentCurationService::class);
        $this->app->singleton(\App\Services\News\EventExtractionService::class);
        $this->app->singleton(\App\Services\News\EventPublishingService::class);
        $this->app->singleton(\App\Services\News\FactCheckingService::class);
        $this->app->singleton(\App\Services\News\FetchFrequencyService::class);
        $this->app->singleton(\App\Services\News\ImageStorageService::class);
        $this->app->singleton(\App\Services\News\NewsCollectionService::class);
        $this->app->singleton(\App\Services\News\NewsWorkflowService::class);
        $this->app->singleton(\App\Services\News\PerformerMatchingService::class);
        $this->app->singleton(\App\Services\News\PrismAiService::class);
        $this->app->singleton(\App\Services\News\PublishingService::class);
        $this->app->singleton(\App\Services\News\ScrapingBeeService::class);
        $this->app->singleton(\App\Services\News\SerpApiService::class);
        $this->app->singleton(\App\Services\News\UnsplashService::class);
        $this->app->singleton(\App\Services\News\VenueMatchingService::class);
        $this->app->singleton(\App\Services\News\WorkflowSettingsService::class);

        // Register AI Creator services
        $this->app->singleton(\App\Services\Creator\AiCreatorAssistantService::class);
        $this->app->singleton(\App\Services\Creator\ContentModeratorService::class);

        // Register Story Follow-Up services
        $this->app->singleton(\App\Services\Story\StoryFollowUpService::class);
        $this->app->singleton(\App\Services\Story\EngagementScoringService::class);
        $this->app->singleton(\App\Services\Story\StoryAnalysisService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \App\Models\DayNewsPost::observe(\App\Observers\DayNewsPostObserver::class);
        if (! config('makerkit.auth.magiclink.enabled') && ! config('makerkit.auth.password.enabled')) {
            throw new Exception('Magic link or password authentication must be enabled');
        }

        Gate::define('access-admin', fn (User $user): bool => $user->isAdmin());

        $this->configureRateLimiting();
        $this->configureRedisClient();
        $this->handleRedisConnection();
    }

    /**
     * Auto-detect and configure Redis client
     * Use phpredis if extension is loaded, otherwise fallback to predis
     */
    private function configureRedisClient(): void
    {
        // Only auto-detect if REDIS_CLIENT is not explicitly set
        if (! env('REDIS_CLIENT')) {
            $client = (extension_loaded('redis') || function_exists('redis_connect')) ? 'phpredis' : 'predis';
            config(['database.redis.client' => $client]);
        }

        // Configure Redis TLS if enabled
        $redisScheme = env('REDIS_SCHEME', 'tcp');
        $redisTls = env('REDIS_TLS', false);

        // Configure Redis timeouts to prevent hanging connections
        // This helps prevent 504 Gateway Timeout errors
        $timeout = (int) env('REDIS_TIMEOUT', 5); // 5 second timeout
        $readTimeout = (int) env('REDIS_READ_TIMEOUT', 5);

        // Set timeout options for Redis connections
        $options = config('database.redis.options', []);
        $options['timeout'] = $timeout;
        $options['read_timeout'] = $readTimeout;
        config(['database.redis.options' => $options]);

        // Configure default connection with TLS if enabled
        $defaultConfig = config('database.redis.default', []);
        $defaultConfig['scheme'] = $redisScheme;

        // Configure TLS/SSL based on client type
        $client = config('database.redis.client', 'predis');
        if ($redisTls || $redisScheme === 'tls') {
            if ($client === 'phpredis') {
                // phpredis uses 'scheme' => 'tls' and 'ssl' context options
                $defaultConfig['scheme'] = 'tls';
                $defaultConfig['ssl'] = [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ];
            } else {
                // predis uses 'scheme' => 'tls' and 'ssl' options
                $defaultConfig['scheme'] = 'tls';
                $defaultConfig['ssl'] = [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ];
            }
        }
        if (! isset($defaultConfig['timeout'])) {
            $defaultConfig['timeout'] = $timeout;
        }
        if (! isset($defaultConfig['read_timeout'])) {
            $defaultConfig['read_timeout'] = $readTimeout;
        }
        config(['database.redis.default' => $defaultConfig]);

        // Configure cache connection with TLS if enabled
        $cacheConfig = config('database.redis.cache', []);
        $cacheConfig['scheme'] = $redisScheme;
        if ($redisTls || $redisScheme === 'tls') {
            if ($client === 'phpredis') {
                // phpredis uses 'scheme' => 'tls' and 'ssl' context options
                $cacheConfig['scheme'] = 'tls';
                $cacheConfig['ssl'] = [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ];
            } else {
                // predis uses 'scheme' => 'tls' and 'ssl' options
                $cacheConfig['scheme'] = 'tls';
                $cacheConfig['ssl'] = [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ];
            }
        }
        if (! isset($cacheConfig['timeout'])) {
            $cacheConfig['timeout'] = $timeout;
        }
        if (! isset($cacheConfig['read_timeout'])) {
            $cacheConfig['read_timeout'] = $readTimeout;
        }
        config(['database.redis.cache' => $cacheConfig]);
    }

    /**
     * Handle Redis connection errors gracefully
     * If Redis is configured but unavailable, log warning but don't crash
     */
    private function handleRedisConnection(): void
    {
        // Only check Redis if it's actually configured as a driver
        $cacheDriver = config('cache.default');
        $sessionDriver = config('session.driver');
        $queueDriver = config('queue.default');

        $redisNeeded = in_array($cacheDriver, ['redis'], true) ||
            in_array($sessionDriver, ['redis'], true) ||
            in_array($queueDriver, ['redis'], true);

        if ($redisNeeded) {
            try {
                // Test Redis connection
                $redis = \Illuminate\Support\Facades\Redis::connection();
                $redis->ping();
            } catch (Throwable $e) {
                // Redis is unavailable - log warning
                \Illuminate\Support\Facades\Log::warning('Redis connection failed', [
                    'error' => $e->getMessage(),
                    'cache_driver' => $cacheDriver,
                    'session_driver' => $sessionDriver,
                    'queue_driver' => $queueDriver,
                ]);
                // Note: We don't change config here as it won't persist
                // Instead, handle errors in exception handler
            }
        }
    }

    /**
     * Configure the rate limiters for the application.
     */
    private function configureRateLimiting(): void
    {
        // API rate limiting
        RateLimiter::for('api', fn () => Limit::perMinute(60)->by(request()->user()?->id ?: request()->ip()));
        RateLimiter::for('api-public', fn () => Limit::perMinute(30)->by(request()->ip()));

        // Rate limiter for geocoding jobs - Google Maps API allows 50 requests/second
        // We limit to 10 per second to be safe and avoid hitting API limits
        RateLimiter::for('geocoding', fn () => Limit::perSecond(10));

        // Rate limiter for location API - prevent abuse of search/detection endpoints
        // 30 requests per minute per IP for search (allow for autocomplete typing)
        RateLimiter::for('location-search', fn () => Limit::perMinute(30)->by(request()->ip()));

        // 10 requests per minute per IP for set/detect/clear operations
        RateLimiter::for('location-actions', fn () => Limit::perMinute(10)->by(request()->ip()));
    }
}
