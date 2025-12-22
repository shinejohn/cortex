<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;

final class CacheService
{
    /**
     * Cache duration constants (in seconds)
     */
    public const DURATION_SHORT = 300; // 5 minutes
    public const DURATION_MEDIUM = 1800; // 30 minutes
    public const DURATION_LONG = 3600; // 1 hour
    public const DURATION_DAY = 86400; // 24 hours

    /**
     * Cache key prefixes
     */
    public const PREFIX_EVENT = 'event:';
    public const PREFIX_VENUE = 'venue:';
    public const PREFIX_PERFORMER = 'performer:';
    public const PREFIX_HUB = 'hub:';
    public const PREFIX_WEATHER = 'weather:';
    public const PREFIX_FEATURED = 'featured:';
    public const PREFIX_TRENDING = 'trending:';

    /**
     * Get cached value or execute callback and cache result
     */
    public function remember(string $key, int $duration, callable $callback): mixed
    {
        return Cache::remember($key, $duration, $callback);
    }

    /**
     * Cache event data
     */
    public function cacheEvent(string $eventId, callable $callback, int $duration = self::DURATION_MEDIUM): mixed
    {
        return $this->remember(self::PREFIX_EVENT.$eventId, $duration, $callback);
    }

    /**
     * Cache venue data
     */
    public function cacheVenue(string $venueId, callable $callback, int $duration = self::DURATION_MEDIUM): mixed
    {
        return $this->remember(self::PREFIX_VENUE.$venueId, $duration, $callback);
    }

    /**
     * Cache performer data
     */
    public function cachePerformer(string $performerId, callable $callback, int $duration = self::DURATION_MEDIUM): mixed
    {
        return $this->remember(self::PREFIX_PERFORMER.$performerId, $duration, $callback);
    }

    /**
     * Cache hub data
     */
    public function cacheHub(string $hubId, callable $callback, int $duration = self::DURATION_MEDIUM): mixed
    {
        return $this->remember(self::PREFIX_HUB.$hubId, $duration, $callback);
    }

    /**
     * Cache weather data
     */
    public function cacheWeather(string $locationKey, callable $callback, int $duration = self::DURATION_SHORT): mixed
    {
        return $this->remember(self::PREFIX_WEATHER.$locationKey, $duration, $callback);
    }

    /**
     * Cache featured content
     */
    public function cacheFeatured(string $type, callable $callback, int $duration = self::DURATION_MEDIUM): mixed
    {
        return $this->remember(self::PREFIX_FEATURED.$type, $duration, $callback);
    }

    /**
     * Cache trending content
     */
    public function cacheTrending(string $type, callable $callback, int $duration = self::DURATION_SHORT): mixed
    {
        return $this->remember(self::PREFIX_TRENDING.$type, $duration, $callback);
    }

    /**
     * Clear cache for specific key
     */
    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    /**
     * Clear cache for event
     */
    public function forgetEvent(string $eventId): bool
    {
        return $this->forget(self::PREFIX_EVENT.$eventId);
    }

    /**
     * Clear cache for venue
     */
    public function forgetVenue(string $venueId): bool
    {
        return $this->forget(self::PREFIX_VENUE.$venueId);
    }

    /**
     * Clear cache for performer
     */
    public function forgetPerformer(string $performerId): bool
    {
        return $this->forget(self::PREFIX_PERFORMER.$performerId);
    }

    /**
     * Clear cache for hub
     */
    public function forgetHub(string $hubId): bool
    {
        return $this->forget(self::PREFIX_HUB.$hubId);
    }

    /**
     * Clear featured cache
     */
    public function forgetFeatured(string $type): bool
    {
        return $this->forget(self::PREFIX_FEATURED.$type);
    }

    /**
     * Clear trending cache
     */
    public function forgetTrending(string $type): bool
    {
        return $this->forget(self::PREFIX_TRENDING.$type);
    }

    /**
     * Clear all cache with prefix
     */
    public function forgetByPrefix(string $prefix): void
    {
        // Implementation depends on cache driver
        // For Redis: use SCAN and delete matching keys
        // For file: clear specific tags if using tag-based caching
    }
}

