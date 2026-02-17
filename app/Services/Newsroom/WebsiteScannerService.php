<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\Business;
use App\Models\CollectionMethod;
use App\Models\NewsSource;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class WebsiteScannerService
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

    /**
     * @return array{news_source: ?NewsSource, collection_methods: array, platform_detected: ?string}
     */
    public function scanBusiness(Business $business): array
    {
        $website = $business->website;
        if (empty($website)) {
            return ['news_source' => null, 'collection_methods' => [], 'platform_detected' => null];
        }

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
            $html = $this->fetchPage($website);
            if (! $html) {
                Log::warning('WebsiteScanner: Could not fetch homepage', ['url' => $website]);

                return ['news_source' => null, 'collection_methods' => [], 'platform_detected' => null];
            }

            $results['rss_feeds'] = $this->discoverRssFromHtml($html, $website);
            $results['rss_feeds'] = array_merge(
                $results['rss_feeds'],
                $this->probeCommonRssPaths($website)
            );
            $results['rss_feeds'] = array_unique($results['rss_feeds']);

            $results['sitemap_urls'] = $this->discoverFromSitemap($website);
            $results['platform'] = $this->detectPlatform($html, $website);

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

    private function discoverRssFromHtml(string $html, string $baseUrl): array
    {
        $feeds = [];

        preg_match_all(
            '/<link[^>]+type=["\']application\/(rss|atom)\+xml["\'][^>]*>/i',
            $html,
            $matches
        );

        foreach ($matches[0] ?? [] as $linkTag) {
            if (preg_match('/href=["\']([^"\']+)["\']/', $linkTag, $hrefMatch)) {
                $feedUrl = $this->resolveUrl($hrefMatch[1], $baseUrl);
                if ($feedUrl) {
                    $feeds[] = $feedUrl;
                }
            }
        }

        return $feeds;
    }

    private function probeCommonRssPaths(string $baseUrl): array
    {
        $feeds = [];
        $base = mb_rtrim($baseUrl, '/');

        foreach (self::COMMON_RSS_PATHS as $path) {
            try {
                $response = Http::timeout(5)
                    ->withOptions(['allow_redirects' => true])
                    ->head($base.$path);

                if ($response->successful()) {
                    $contentType = $response->header('Content-Type', '');
                    if (str_contains($contentType, 'xml') || str_contains($contentType, 'rss')) {
                        $feeds[] = $base.$path;
                    }
                }
            } catch (Exception $e) {
                // Silently skip failed probes
            }
        }

        return $feeds;
    }

    private function discoverFromSitemap(string $baseUrl): array
    {
        $contentUrls = [];
        $base = mb_rtrim($baseUrl, '/');

        try {
            $response = Http::timeout(10)->get($base.'/sitemap.xml');
            if (! $response->successful()) {
                $robots = Http::timeout(5)->get($base.'/robots.txt');
                if ($robots->successful() && preg_match('/Sitemap:\s*(.+)/i', $robots->body(), $m)) {
                    $response = Http::timeout(10)->get(mb_trim($m[1]));
                }
            }

            if ($response->successful()) {
                $xml = $response->body();
                preg_match_all('/<loc>([^<]+)<\/loc>/i', $xml, $urls);

                foreach ($urls[1] ?? [] as $url) {
                    $path = mb_strtolower(parse_url($url, PHP_URL_PATH) ?? '');
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

        return array_slice($contentUrls, 0, 50);
    }

    private function detectPlatform(string $html, string $url): ?string
    {
        $htmlLower = mb_strtolower($html);
        $urlLower = mb_strtolower($url);

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
            if (isset($indicators['path']) && str_contains($urlLower, mb_strtolower($indicators['path']))) {
                return $platform;
            }
        }

        return null;
    }

    /**
     * @return array{news_source: NewsSource, collection_methods: array, platform_detected: ?string}
     */
    private function createSourceAndMethods(Business $business, string $website, array $results): array
    {
        $sourceType = $this->inferSourceType($business);

        $newsSource = NewsSource::where('business_id', $business->id)->first();

        if (! $newsSource) {
            $regionId = $business->community?->regions()->first()?->id;

            $newsSource = NewsSource::create([
                'community_id' => $business->community_id,
                'region_id' => $regionId,
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

        foreach ($results['rss_feeds'] as $feedUrl) {
            $existing = CollectionMethod::where('source_id', $newsSource->id)
                ->where('endpoint_url', $feedUrl)
                ->exists();

            if (! $existing) {
                $methods[] = CollectionMethod::create([
                    'source_id' => $newsSource->id,
                    'method_type' => CollectionMethod::TYPE_RSS,
                    'name' => "{$business->name} RSS Feed",
                    'endpoint_url' => $feedUrl,
                    'poll_interval_minutes' => 60,
                    'is_enabled' => true,
                    'is_primary' => empty($methods),
                ]);
            }
        }

        foreach (array_slice($results['sitemap_urls'], 0, 5) as $contentUrl) {
            $exists = CollectionMethod::where('source_id', $newsSource->id)
                ->where('endpoint_url', $contentUrl)
                ->exists();
            if ($exists) {
                continue;
            }
            $methods[] = CollectionMethod::create([
                'source_id' => $newsSource->id,
                'method_type' => CollectionMethod::TYPE_SCRAPE,
                'name' => "{$business->name} Content Page",
                'endpoint_url' => $contentUrl,
                'poll_interval_minutes' => 360,
                'is_enabled' => true,
                'is_primary' => false,
            ]);
        }

        if ($results['platform']) {
            $platformType = match ($results['platform']) {
                'civicplus' => CollectionMethod::TYPE_CIVICPLUS,
                'nixle' => CollectionMethod::TYPE_NIXLE,
                default => CollectionMethod::TYPE_SCRAPE,
            };

            $platformExists = CollectionMethod::where('source_id', $newsSource->id)
                ->where('method_type', $platformType)
                ->exists();
            if (! $platformExists) {
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

        if (in_array($primaryType, $govTypes) || ! empty(array_intersect($categories, $govTypes))) {
            return NewsSource::TYPE_GOVERNMENT;
        }
        if (in_array($primaryType, $eduTypes) || ! empty(array_intersect($categories, $eduTypes))) {
            return NewsSource::TYPE_EDUCATION;
        }
        if (in_array($primaryType, $venueTypes) || ! empty(array_intersect($categories, $venueTypes))) {
            return NewsSource::TYPE_VENUE;
        }

        return NewsSource::TYPE_BUSINESS;
    }

    private function inferPriority(Business $business): int
    {
        $highPriority = ['city_hall', 'police', 'fire_station', 'school', 'hospital', 'university'];
        if (in_array($business->primary_type, $highPriority)) {
            return 70;
        }

        return 50;
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
        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            $url = 'https://'.$url;
        }

        return mb_rtrim($url, '/');
    }

    private function resolveUrl(string $href, string $baseUrl): ?string
    {
        if (str_starts_with($href, 'http')) {
            return $href;
        }
        if (str_starts_with($href, '//')) {
            return 'https:'.$href;
        }
        if (str_starts_with($href, '/')) {
            $parsed = parse_url($baseUrl);

            return ($parsed['scheme'] ?? 'https').'://'.($parsed['host'] ?? '').$href;
        }

        return mb_rtrim($baseUrl, '/').'/'.mb_ltrim($href, '/');
    }
}
