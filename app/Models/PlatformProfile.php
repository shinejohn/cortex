<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Platform Profile
 *
 * Stores learned patterns for website platforms (WordPress, CivicPlus, Squarespace, etc.)
 * One profile serves ALL sites on that platform — learn once, apply everywhere.
 */
final class PlatformProfile extends Model
{
    use HasUuids;

    // Fetch methods
    public const METHOD_HTTP_GET = 'http_get';

    public const METHOD_PLAYWRIGHT = 'playwright';

    public const METHOD_SCRAPINGBEE = 'scrapingbee';

    public const METHOD_SCRAPINGBEE_JS = 'scrapingbee_js';

    public const METHOD_FIRECRAWL = 'firecrawl';

    public const METHOD_RSS = 'rss';

    public const METHOD_AI_EXTRACT = 'ai_extract'; // Strip HTML, let AI read it

    // Categories
    public const CAT_CMS = 'cms';

    public const CAT_GOVERNMENT = 'government';

    public const CAT_ECOMMERCE = 'ecommerce';

    public const CAT_WEBSITE_BUILDER = 'website_builder';

    public const CAT_NEWS = 'news';

    public const CAT_EVENTS = 'events';

    public const CAT_SOCIAL = 'social';

    public const CAT_CUSTOM = 'custom';

    public const CAT_UNKNOWN = 'unknown';

    protected $fillable = [
        'slug', 'display_name', 'category', 'detection_signatures',
        'best_fetch_method', 'fallback_fetch_method', 'needs_js_rendering',
        'content_selectors', 'noise_selectors', 'rss_patterns', 'api_patterns',
        'avg_response_time_ms', 'avg_content_quality', 'sample_size',
        'confidence_score', 'is_active', 'metadata',
    ];

    protected $casts = [
        'detection_signatures' => 'array',
        'content_selectors' => 'array',
        'noise_selectors' => 'array',
        'rss_patterns' => 'array',
        'api_patterns' => 'array',
        'needs_js_rendering' => 'boolean',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Find a profile by its slug
     */
    public static function findBySlug(string $slug): ?self
    {
        return self::where('slug', $slug)->first();
    }

    public function newsSources(): HasMany
    {
        return $this->hasMany(NewsSource::class, 'platform_profile_id');
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    public function scopeByCategory($q, string $cat)
    {
        return $q->where('category', $cat);
    }

    public function scopeHighConfidence($q, float $min = 0.7)
    {
        return $q->where('confidence_score', '>=', $min);
    }

    /**
     * Record a successful fetch and update averages
     */
    public function recordFetchResult(int $responseTimeMs, float $contentQuality): void
    {
        $n = $this->sample_size;
        $newN = $n + 1;

        $this->update([
            'avg_response_time_ms' => (($this->avg_response_time_ms ?? 0) * $n + $responseTimeMs) / $newN,
            'avg_content_quality' => (($this->avg_content_quality ?? 0) * $n + $contentQuality) / $newN,
            'sample_size' => $newN,
            'confidence_score' => min(1.0, $newN / 20), // Full confidence at 20 samples
        ]);
    }

    /**
     * Get the best content selectors as a flat list
     */
    public function getContentSelectorsString(): string
    {
        $selectors = $this->content_selectors ?? [];

        return implode(', ', $selectors);
    }

    /**
     * Get noise selectors to remove
     */
    public function getNoiseSelectorsString(): string
    {
        $selectors = $this->noise_selectors ?? [];

        return implode(', ', $selectors);
    }

    /**
     * Check if this profile has enough data to be trusted
     */
    public function isTrusted(): bool
    {
        return $this->confidence_score >= 0.5 && $this->sample_size >= 5;
    }

    /**
     * Get RSS feed URL for a given base URL using known patterns
     */
    public function guessRssUrl(string $baseUrl): ?string
    {
        if (empty($this->rss_patterns)) {
            return null;
        }

        $base = mb_rtrim($baseUrl, '/');

        // Return the most common pattern
        return $base.($this->rss_patterns[0] ?? '');
    }
}
