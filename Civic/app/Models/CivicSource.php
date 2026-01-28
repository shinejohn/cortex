<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Civic Source Model
 * 
 * Represents an individual civic data source (a specific city's Legistar, a Nixle agency, etc.)
 */
class CivicSource extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'region_id',
        'platform_id',
        'name',
        'source_type',
        'entity_type',
        'base_url',
        'api_endpoint',
        'api_client_name',
        'rss_feed_url',
        'agency_id',
        'zip_codes',
        'county',
        'state',
        'config',
        'available_feeds',
        'poll_interval_minutes',
        'last_collected_at',
        'last_items_found',
        'next_collection_at',
        'is_enabled',
        'is_verified',
        'consecutive_failures',
        'health_score',
        'last_error',
        'last_error_at',
        'auto_discovered',
        'discovered_at',
        'verified_at',
    ];

    protected $casts = [
        'config' => 'array',
        'available_feeds' => 'array',
        'poll_interval_minutes' => 'integer',
        'last_collected_at' => 'datetime',
        'next_collection_at' => 'datetime',
        'last_items_found' => 'integer',
        'is_enabled' => 'boolean',
        'is_verified' => 'boolean',
        'consecutive_failures' => 'integer',
        'health_score' => 'integer',
        'last_error_at' => 'datetime',
        'auto_discovered' => 'boolean',
        'discovered_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    /**
     * Source types
     */
    public const TYPE_RSS = 'rss';
    public const TYPE_API = 'api';
    public const TYPE_SCRAPE = 'scrape';

    /**
     * Entity types
     */
    public const ENTITY_CITY = 'city';
    public const ENTITY_COUNTY = 'county';
    public const ENTITY_SCHOOL_DISTRICT = 'school_district';
    public const ENTITY_POLICE = 'police';
    public const ENTITY_FIRE = 'fire';
    public const ENTITY_STATE_AGENCY = 'state_agency';

    /**
     * Get the region this source belongs to
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Get the platform this source uses
     */
    public function platform(): BelongsTo
    {
        return $this->belongsTo(CivicSourcePlatform::class, 'platform_id');
    }

    /**
     * Get all content items from this source
     */
    public function contentItems(): HasMany
    {
        return $this->hasMany(CivicContentItem::class);
    }

    /**
     * Get collection runs for this source
     */
    public function collectionRuns(): HasMany
    {
        return $this->hasMany(CivicCollectionRun::class);
    }

    /**
     * Scope to only enabled sources
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope to only verified sources
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope to sources due for collection
     */
    public function scopeDueForCollection($query)
    {
        return $query->where('is_enabled', true)
            ->where(function ($q) {
                $q->whereNull('next_collection_at')
                    ->orWhere('next_collection_at', '<=', now());
            });
    }

    /**
     * Scope to healthy sources (health score above threshold)
     */
    public function scopeHealthy($query, int $minScore = 50)
    {
        return $query->where('health_score', '>=', $minScore);
    }

    /**
     * Scope by platform name
     */
    public function scopeForPlatform($query, string $platformName)
    {
        return $query->whereHas('platform', function ($q) use ($platformName) {
            $q->where('name', $platformName);
        });
    }

    /**
     * Scope by region
     */
    public function scopeForRegion($query, $region)
    {
        $regionId = $region instanceof Region ? $region->id : $region;
        return $query->where('region_id', $regionId);
    }

    /**
     * Check if source is due for collection
     */
    public function isDueForCollection(): bool
    {
        if (!$this->is_enabled) {
            return false;
        }

        if ($this->next_collection_at === null) {
            return true;
        }

        return $this->next_collection_at->isPast();
    }

    /**
     * Calculate next collection time
     */
    public function calculateNextCollection(): \Carbon\Carbon
    {
        return now()->addMinutes($this->poll_interval_minutes);
    }

    /**
     * Mark collection as started
     */
    public function markCollectionStarted(): CivicCollectionRun
    {
        return $this->collectionRuns()->create([
            'region_id' => $this->region_id,
            'started_at' => now(),
            'status' => 'running',
        ]);
    }

    /**
     * Mark collection as completed
     */
    public function markCollectionCompleted(int $itemsFound, int $itemsNew = 0): void
    {
        $this->update([
            'last_collected_at' => now(),
            'last_items_found' => $itemsFound,
            'next_collection_at' => $this->calculateNextCollection(),
            'consecutive_failures' => 0,
            'last_error' => null,
            'last_error_at' => null,
            'health_score' => min(100, $this->health_score + 5),
        ]);
    }

    /**
     * Mark collection as failed
     */
    public function markCollectionFailed(string $error): void
    {
        $failures = $this->consecutive_failures + 1;
        $healthScore = max(0, $this->health_score - (10 * $failures));

        $this->update([
            'consecutive_failures' => $failures,
            'last_error' => $error,
            'last_error_at' => now(),
            'health_score' => $healthScore,
            'next_collection_at' => $this->calculateNextCollection(),
            // Disable if too many failures
            'is_enabled' => $failures < 10,
        ]);
    }

    /**
     * Get ZIP codes as array
     */
    public function getZipCodesArray(): array
    {
        if (empty($this->zip_codes)) {
            return [];
        }

        return array_map('trim', explode(',', $this->zip_codes));
    }

    /**
     * Get the effective collection URL based on source type
     */
    public function getCollectionUrl(): ?string
    {
        return match ($this->source_type) {
            self::TYPE_RSS => $this->rss_feed_url,
            self::TYPE_API => $this->api_endpoint,
            self::TYPE_SCRAPE => $this->base_url,
            default => null,
        };
    }

    /**
     * Get platform-specific config value
     */
    public function getConfigValue(string $key, mixed $default = null): mixed
    {
        return data_get($this->config, $key, $default);
    }
}
