# TASK-07-P6: Create WebsiteScannerService

## Context

After Phase 1 discovers businesses with websites, Phase 2 needs to scan each website to find RSS feeds, sitemaps, content pages, and government platform signatures. This converts raw business websites into actionable `NewsSource` + `CollectionMethod` records that Pipeline B can collect from.

**Depends on:** TASK-06 (community rollout job dispatches Phase 2).

### Existing Models Used

- `NewsSource` — `app/Models/NewsSource.php` (has `source_type`, `platform`, `business_id`, `community_id`)
- `CollectionMethod` — `app/Models/CollectionMethod.php` (has `method_type`, `endpoint_url`, `scrape_config`)
- Constants on `CollectionMethod`: `TYPE_RSS`, `TYPE_SCRAPE`, `TYPE_CIVICPLUS`, `TYPE_NIXLE`, etc.

---

## Objective

Create `WebsiteScannerService` that accepts a business with a website URL and discovers all collectible content endpoints (RSS feeds, sitemaps, platform-specific APIs), then creates `NewsSource` and `CollectionMethod` records.

---

## Files to Create

### 1. CREATE: WebsiteScannerService

**File:** `app/Services/Newsroom/WebsiteScannerService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\Business;
use App\Models\CollectionMethod;
use App\Models\NewsSource;
use App\Services\News\PrismAiService;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebsiteScannerService
{
    private const COMMON_RSS_PATHS = [
        '/feed', '/rss', '/feed.xml', '/rss.xml', '/atom.xml',
        '/news/feed', '/blog/feed', '/feed/rss', '/feeds/posts/default',
        '/news/rss', '/blog/rss', '/press/feed', '/events/feed',
    ];

    private const GOVERNMENT_PLATFORMS = [
        'civicplus' => ['signature' => 'civicplus.com', 'css' => '.cp-', 'meta' => 'CivicPlus'],
        'granicus' => ['signature' => 'granicus.com', 'css' => '.granicus', 'meta' => 'Granicus'],
        'legistar' => ['signature' => 'legistar.com', 'path' => '/Legislation'],
        'nixle' => ['signature' => 'nixle.com'],
    ];

    private const CONTENT_KEYWORDS = [
        'news', 'events', 'press', 'announcements', 'minutes',
        'agendas', 'arrests', 'blotter', 'calendar', 'blog',
        'releases', 'meetings', 'reports', 'notices',
    ];

    public function __construct(
        private readonly PrismAiService $aiService,
    ) {}

    /**
     * Scan a business website and create NewsSource + CollectionMethod records.
     *
     * @return array{news_source: ?NewsSource, collection_methods: array, platform_detected: ?string}
     */
    public function scanBusiness(Business $business): array
    {
        $website = $business->website;
        if (empty($website)) {
            return ['news_source' => null, 'collection_methods' => [], 'platform_detected' => null];
        }

        // Normalize URL
        $website = $this->normalizeUrl($website);

        Log::info('WebsiteScanner: Scanning business', [
            'business_id' => $business->id,
            'name' => $business->name,
            'url' => $website,
        ]);

        $results = [
            'rss_feeds' => [],
            'sitemap_urls' => [],
            'content_pages' => [],
            'platform' => null,
        ];

        try {
            // Step 1: Fetch homepage HTML
            $html = $this->fetchPage($website);
            if (!$html) {
                Log::warning('WebsiteScanner: Could not fetch homepage', ['url' => $website]);
                return ['news_source' => null, 'collection_methods' => [], 'platform_detected' => null];
            }

            // Step 2: Check for RSS/Atom feeds in HTML <link> tags
            $results['rss_feeds'] = $this->discoverRssFromHtml($html, $website);

            // Step 3: Check common RSS paths
            $results['rss_feeds'] = array_merge(
                $results['rss_feeds'],
                $this->probeCommonRssPaths($website)
            );
            $results['rss_feeds'] = array_unique($results['rss_feeds']);

            // Step 4: Parse sitemap for content URLs
            $results['sitemap_urls'] = $this->discoverFromSitemap($website);

            // Step 5: Detect government platforms
            $results['platform'] = $this->detectPlatform($html, $website);

            // Step 6: Create NewsSource and CollectionMethods
            return $this->createSourceAndMethods($business, $website, $results);

        } catch (Exception $e) {
            Log::error('WebsiteScanner: Scan failed', [
                'business' => $business->name,
                'url' => $website,
                'error' => $e->getMessage(),
            ]);
            return ['news_source' => null, 'collection_methods' => [], 'platform_detected' => null];
        }
    }

    /**
     * Discover RSS/Atom feeds from HTML <link> tags.
     */
    private function discoverRssFromHtml(string $html, string $baseUrl): array
    {
        $feeds = [];

        // Match <link> tags with RSS/Atom types
        preg_match_all(
            '/<link[^>]+type=["\']application\/(rss|atom)\+xml["\'][^>]*>/i',
            $html,
            $matches
        );

        foreach ($matches[0] as $linkTag) {
            if (preg_match('/href=["\']([^"\']+)["\']/', $linkTag, $hrefMatch)) {
                $feedUrl = $this->resolveUrl($hrefMatch[1], $baseUrl);
                if ($feedUrl) $feeds[] = $feedUrl;
            }
        }

        return $feeds;
    }

    /**
     * Probe common RSS paths.
     */
    private function probeCommonRssPaths(string $baseUrl): array
    {
        $feeds = [];
        $base = rtrim($baseUrl, '/');

        foreach (self::COMMON_RSS_PATHS as $path) {
            try {
                $response = Http::timeout(5)
                    ->withOptions(['allow_redirects' => true])
                    ->head($base . $path);

                if ($response->successful()) {
                    $contentType = $response->header('Content-Type', '');
                    if (str_contains($contentType, 'xml') || str_contains($contentType, 'rss')) {
                        $feeds[] = $base . $path;
                    }
                }
            } catch (Exception $e) {
                // Silently skip failed probes
            }
        }

        return $feeds;
    }

    /**
     * Parse sitemap.xml for content URLs containing news/event keywords.
     */
    private function discoverFromSitemap(string $baseUrl): array
    {
        $contentUrls = [];
        $base = rtrim($baseUrl, '/');

        try {
            // Try sitemap.xml directly
            $response = Http::timeout(10)->get($base . '/sitemap.xml');
            if (!$response->successful()) {
                // Try robots.txt for sitemap location
                $robots = Http::timeout(5)->get($base . '/robots.txt');
                if ($robots->successful() && preg_match('/Sitemap:\s*(.+)/i', $robots->body(), $m)) {
                    $response = Http::timeout(10)->get(trim($m[1]));
                }
            }

            if ($response->successful()) {
                $xml = $response->body();
                preg_match_all('/<loc>([^<]+)<\/loc>/i', $xml, $urls);

                foreach ($urls[1] ?? [] as $url) {
                    $path = strtolower(parse_url($url, PHP_URL_PATH) ?? '');
                    foreach (self::CONTENT_KEYWORDS as $keyword) {
                        if (str_contains($path, $keyword)) {
                            $contentUrls[] = $url;
                            break;
                        }
                    }
                }
            }
        } catch (Exception $e) {
            // Sitemap not available
        }

        return array_slice($contentUrls, 0, 50); // Cap at 50 URLs
    }

    /**
     * Detect government platform signatures.
     */
    private function detectPlatform(string $html, string $url): ?string
    {
        $htmlLower = strtolower($html);
        $urlLower = strtolower($url);

        foreach (self::GOVERNMENT_PLATFORMS as $platform => $indicators) {
            if (isset($indicators['signature']) && str_contains($htmlLower, $indicators['signature'])) {
                return $platform;
            }
            if (isset($indicators['css']) && str_contains($htmlLower, $indicators['css'])) {
                return $platform;
            }
            if (isset($indicators['meta']) && str_contains($html, $indicators['meta'])) {
                return $platform;
            }
            if (isset($indicators['path']) && str_contains($urlLower, strtolower($indicators['path']))) {
                return $platform;
            }
        }

        return null;
    }

    /**
     * Create NewsSource and CollectionMethod records from scan results.
     */
    private function createSourceAndMethods(Business $business, string $website, array $results): array
    {
        // Determine source type from business category
        $sourceType = $this->inferSourceType($business);

        // Check if NewsSource already exists for this business
        $newsSource = NewsSource::where('business_id', $business->id)->first();

        if (!$newsSource) {
            $newsSource = NewsSource::create([
                'community_id' => $business->community_id,
                'region_id' => null, // Set from community's primary region if available
                'name' => $business->name,
                'source_type' => $sourceType,
                'website_url' => $website,
                'business_id' => $business->id,
                'is_potential_customer' => true,
                'platform' => $results['platform'],
                'default_poll_interval_minutes' => 60,
                'priority' => $this->inferPriority($business),
                'is_active' => true,
                'is_verified' => false,
                'health_score' => 100,
            ]);
        }

        $methods = [];

        // Create CollectionMethod for each RSS feed
        foreach ($results['rss_feeds'] as $feedUrl) {
            $existing = CollectionMethod::where('source_id', $newsSource->id)
                ->where('endpoint_url', $feedUrl)
                ->exists();

            if (!$existing) {
                $methods[] = CollectionMethod::create([
                    'source_id' => $newsSource->id,
                    'method_type' => CollectionMethod::TYPE_RSS,
                    'name' => "{$business->name} RSS Feed",
                    'endpoint_url' => $feedUrl,
                    'poll_interval_minutes' => 60,
                    'is_enabled' => true,
                    'is_primary' => empty($methods), // First one is primary
                ]);
            }
        }

        // Create CollectionMethod for scrape targets from sitemap
        foreach (array_slice($results['sitemap_urls'], 0, 5) as $contentUrl) {
            $methods[] = CollectionMethod::create([
                'source_id' => $newsSource->id,
                'method_type' => CollectionMethod::TYPE_SCRAPE,
                'name' => "{$business->name} Content Page",
                'endpoint_url' => $contentUrl,
                'poll_interval_minutes' => 360, // Every 6 hours for scrape targets
                'is_enabled' => true,
                'is_primary' => false,
            ]);
        }

        // Create platform-specific CollectionMethod if government platform detected
        if ($results['platform']) {
            $platformType = match ($results['platform']) {
                'civicplus' => CollectionMethod::TYPE_CIVICPLUS,
                'nixle' => CollectionMethod::TYPE_NIXLE,
                default => CollectionMethod::TYPE_SCRAPE,
            };

            $methods[] = CollectionMethod::create([
                'source_id' => $newsSource->id,
                'method_type' => $platformType,
                'name' => "{$business->name} ({$results['platform']})",
                'endpoint_url' => $website,
                'platform_config' => ['platform' => $results['platform']],
                'poll_interval_minutes' => 30,
                'is_enabled' => true,
                'is_primary' => true,
            ]);
        }

        Log::info('WebsiteScanner: Created source and methods', [
            'business' => $business->name,
            'news_source_id' => $newsSource->id,
            'rss_feeds' => count($results['rss_feeds']),
            'scrape_targets' => min(count($results['sitemap_urls']), 5),
            'platform' => $results['platform'],
            'total_methods' => count($methods),
        ]);

        return [
            'news_source' => $newsSource,
            'collection_methods' => $methods,
            'platform_detected' => $results['platform'],
        ];
    }

    private function inferSourceType(Business $business): string
    {
        $govTypes = ['city_hall', 'courthouse', 'local_government_office', 'police', 'fire_station', 'post_office'];
        $eduTypes = ['school', 'university', 'preschool'];
        $venueTypes = ['event_venue', 'convention_center', 'performing_arts_theater', 'stadium'];

        $primaryType = $business->primary_type ?? '';
        $categories = $business->categories ?? [];

        if (in_array($primaryType, $govTypes) || !empty(array_intersect($categories, $govTypes))) {
            return NewsSource::TYPE_GOVERNMENT;
        }
        if (in_array($primaryType, $eduTypes) || !empty(array_intersect($categories, $eduTypes))) {
            return NewsSource::TYPE_EDUCATION;
        }
        if (in_array($primaryType, $venueTypes) || !empty(array_intersect($categories, $venueTypes))) {
            return NewsSource::TYPE_VENUE;
        }
        return NewsSource::TYPE_BUSINESS;
    }

    private function inferPriority(Business $business): string
    {
        $highPriority = ['city_hall', 'police', 'fire_station', 'school', 'hospital', 'university'];
        if (in_array($business->primary_type, $highPriority)) return 'high';
        return 'normal';
    }

    private function fetchPage(string $url): ?string
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; DayNews/1.0; +https://day.news)'])
                ->get($url);
            return $response->successful() ? $response->body() : null;
        } catch (Exception $e) {
            return null;
        }
    }

    private function normalizeUrl(string $url): string
    {
        if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://')) {
            $url = 'https://' . $url;
        }
        return rtrim($url, '/');
    }

    private function resolveUrl(string $href, string $baseUrl): ?string
    {
        if (str_starts_with($href, 'http')) return $href;
        if (str_starts_with($href, '//')) return 'https:' . $href;
        if (str_starts_with($href, '/')) {
            $parsed = parse_url($baseUrl);
            return ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '') . $href;
        }
        return rtrim($baseUrl, '/') . '/' . ltrim($href, '/');
    }
}
```

### 2. CREATE: ProcessWebsiteScanJob

**File:** `app/Jobs/Rollout/ProcessWebsiteScanJob.php`

```php
<?php

declare(strict_types=1);

namespace App\Jobs\Rollout;

use App\Models\Business;
use App\Models\Rollout\CommunityRollout;
use App\Services\Newsroom\WebsiteScannerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessWebsiteScanJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120;
    public $tries = 2;
    public $backoff = 30;

    public function __construct(
        public Business $business,
        public ?CommunityRollout $communityRollout = null,
    ) {}

    public function handle(WebsiteScannerService $scanner): void
    {
        $result = $scanner->scanBusiness($this->business);

        if ($this->communityRollout && $result['news_source']) {
            $this->communityRollout->increment('news_sources_created');
            $methodCount = count($result['collection_methods']);
            $this->communityRollout->increment('collection_methods_created', $methodCount);
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Website scan job failed', [
            'business_id' => $this->business->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
```

---

## Verification

```bash
php artisan tinker --execute="
    new \App\Services\Newsroom\WebsiteScannerService(app(\App\Services\News\PrismAiService::class));
    echo 'WebsiteScannerService: OK' . PHP_EOL;
    echo 'ProcessWebsiteScanJob: ' . (class_exists(\App\Jobs\Rollout\ProcessWebsiteScanJob::class) ? 'OK' : 'MISSING') . PHP_EOL;
"

# Optional: test scan on a known business website
# php artisan tinker --execute="
#     \$biz = \App\Models\Business::whereNotNull('website')->first();
#     \$scanner = app(\App\Services\Newsroom\WebsiteScannerService::class);
#     \$result = \$scanner->scanBusiness(\$biz);
#     dump(\$result);
# "
```
