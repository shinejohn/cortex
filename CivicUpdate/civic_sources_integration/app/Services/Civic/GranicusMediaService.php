<?php

declare(strict_types=1);

namespace App\Services\Civic;

use App\Models\CivicContentItem;
use App\Models\CivicSource;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Granicus Media Service
 * 
 * Handles integration with Granicus MediaManager/govMeetings platform.
 * This is SEPARATE from Legistar - it's the meeting video/streaming platform.
 * 
 * URL Patterns:
 * - Base: https://{city}.granicus.com
 * - Publishers: /ViewPublisher.php?view_id={ID}
 * - Media RSS: /xml/MediaRSS.php?view_id={ID} or ?publish_id={ID}
 * - Board RSS: /boards/rss/{ID}
 * 
 * Most cities have multiple "publishers" (channels) for different boards:
 * - City Commission
 * - Planning Board
 * - Budget Committee
 * - etc.
 */
class GranicusMediaService
{
    private const REQUEST_TIMEOUT = 30;
    private const MAX_VIEW_ID_PROBE = 50;

    /**
     * Discover all publishers (meeting channels) for a Granicus host
     */
    public function discoverPublishers(string $granicusHost): array
    {
        $publishers = [];
        $baseUrl = $this->normalizeHost($granicusHost);

        Log::info('GranicusMedia: Discovering publishers', ['host' => $baseUrl]);

        // Probe view_id range 1-50
        for ($viewId = 1; $viewId <= self::MAX_VIEW_ID_PROBE; $viewId++) {
            $publisherUrl = "{$baseUrl}/ViewPublisher.php?view_id={$viewId}";

            try {
                $response = Http::timeout(10)->get($publisherUrl);

                if ($response->successful() && !$this->isErrorPage($response->body())) {
                    $publisher = $this->parsePublisherPage($response->body(), $viewId, $baseUrl);
                    
                    if ($publisher) {
                        $publishers[] = $publisher;
                        Log::debug('GranicusMedia: Found publisher', [
                            'view_id' => $viewId,
                            'name' => $publisher['name'] ?? 'Unknown',
                        ]);
                    }
                }
            } catch (Exception $e) {
                // Skip failed probes silently
                continue;
            }
        }

        Log::info('GranicusMedia: Discovery completed', [
            'host' => $baseUrl,
            'publishers_found' => count($publishers),
        ]);

        return $publishers;
    }

    /**
     * Discover RSS feeds for a specific publisher
     */
    public function discoverFeedsForPublisher(string $granicusHost, int $viewId): array
    {
        $feeds = [];
        $baseUrl = $this->normalizeHost($granicusHost);

        // Try known RSS URL patterns
        $rssPatterns = [
            'media_rss_view' => "{$baseUrl}/xml/MediaRSS.php?view_id={$viewId}",
            'media_rss_publish' => "{$baseUrl}/xml/MediaRSS.php?publish_id={$viewId}",
            'boards_rss' => "{$baseUrl}/boards/rss/{$viewId}",
            'boards_rss_param' => "{$baseUrl}/boards/RSS?view_id={$viewId}",
            'feeds' => "{$baseUrl}/feeds/{$viewId}",
            'rss' => "{$baseUrl}/rss/{$viewId}",
        ];

        foreach ($rssPatterns as $type => $url) {
            if ($this->testRssFeed($url)) {
                $feeds[] = [
                    'type' => $type,
                    'url' => $url,
                    'view_id' => $viewId,
                ];
            }
        }

        // Also scan the publisher page for RSS links
        $publisherUrl = "{$baseUrl}/ViewPublisher.php?view_id={$viewId}";
        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)->get($publisherUrl);
            if ($response->successful()) {
                $pageFeeds = $this->extractRssLinksFromHtml($response->body(), $baseUrl);
                foreach ($pageFeeds as $feed) {
                    // Avoid duplicates
                    if (!in_array($feed['url'], array_column($feeds, 'url'))) {
                        $feeds[] = $feed;
                    }
                }
            }
        } catch (Exception $e) {
            // Continue without page scan
        }

        return $feeds;
    }

    /**
     * Fetch items from a Granicus RSS feed
     */
    public function fetchFeed(string $feedUrl): Collection
    {
        Log::info('GranicusMedia: Fetching feed', ['url' => $feedUrl]);

        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)->get($feedUrl);

            if (!$response->successful()) {
                throw new Exception("HTTP {$response->status()}");
            }

            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($response->body());
            libxml_use_internal_errors(false);

            if ($xml === false) {
                throw new Exception("Invalid XML response");
            }

            $items = collect();

            // Parse RSS items (standard RSS 2.0)
            foreach ($xml->channel->item ?? [] as $item) {
                $items->push($this->transformRssItem($item, $feedUrl));
            }

            // Also try Media RSS format (mrss namespace)
            $namespaces = $xml->getNamespaces(true);
            if (isset($namespaces['media'])) {
                foreach ($xml->channel->item ?? [] as $item) {
                    $mediaContent = $item->children($namespaces['media']);
                    if ($mediaContent->content) {
                        // Has media content - enhance the item
                        $enhanced = $this->enhanceWithMediaContent($item, $mediaContent);
                        // Find and update the existing item
                        $guid = (string) $item->guid;
                        $items = $items->map(function ($i) use ($guid, $enhanced) {
                            if (($i['external_id'] ?? '') === $guid) {
                                return array_merge($i, $enhanced);
                            }
                            return $i;
                        });
                    }
                }
            }

            Log::info('GranicusMedia: Feed fetched', [
                'url' => $feedUrl,
                'items' => $items->count(),
            ]);

            return $items;

        } catch (Exception $e) {
            Log::error('GranicusMedia: Failed to fetch feed', [
                'url' => $feedUrl,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Collect all content from a Granicus Media source
     */
    public function collectFromSource(CivicSource $source): array
    {
        $items = [];
        $errors = [];

        $availableFeeds = $source->available_feeds ?? [];

        // If no feeds discovered yet, try to discover them
        if (empty($availableFeeds) && !empty($source->base_url)) {
            $publishers = $this->discoverPublishers($source->base_url);
            
            foreach ($publishers as $publisher) {
                $feeds = $this->discoverFeedsForPublisher(
                    $source->base_url,
                    $publisher['view_id']
                );
                
                foreach ($feeds as $feed) {
                    $feed['publisher_name'] = $publisher['name'];
                    $availableFeeds[] = $feed;
                }
            }

            // Update the source with discovered feeds
            if (!empty($availableFeeds)) {
                $source->update(['available_feeds' => $availableFeeds]);
            }
        }

        // Fetch from all discovered feeds
        foreach ($availableFeeds as $feed) {
            try {
                $feedItems = $this->fetchFeed($feed['url']);
                foreach ($feedItems as $item) {
                    $item['publisher_name'] = $feed['publisher_name'] ?? null;
                    $items[] = $item;
                }
            } catch (Exception $e) {
                $errors[] = "{$feed['url']}: {$e->getMessage()}";
            }
        }

        // Deduplicate by content hash
        $items = collect($items)->unique('content_hash')->values()->toArray();

        if (!empty($errors)) {
            Log::warning('GranicusMedia: Collection completed with errors', [
                'source_id' => $source->id,
                'errors' => $errors,
                'items_collected' => count($items),
            ]);
        }

        return $items;
    }

    /**
     * Detect if a URL points to a Granicus site
     */
    public function detectGranicus(string $url): ?array
    {
        // Check if URL contains granicus.com
        if (preg_match('/https?:\/\/([a-z0-9-]+)\.granicus\.com/i', $url, $match)) {
            return [
                'host' => "https://{$match[1]}.granicus.com",
                'subdomain' => $match[1],
            ];
        }

        // Check page content for Granicus links
        try {
            $response = Http::timeout(10)->get($url);
            if ($response->successful()) {
                if (preg_match('/https?:\/\/([a-z0-9-]+)\.granicus\.com/i', $response->body(), $match)) {
                    return [
                        'host' => "https://{$match[1]}.granicus.com",
                        'subdomain' => $match[1],
                    ];
                }
            }
        } catch (Exception $e) {
            // Continue
        }

        return null;
    }

    /**
     * Find Granicus host from a city's website
     */
    public function findGranicusHost(string $cityWebsite): ?string
    {
        // Common link texts that lead to Granicus
        $linkPatterns = [
            'Watch Meetings',
            'Meeting Videos',
            'Agendas & Minutes',
            'Live Meetings',
            'Video Archive',
            'granicus.com',
        ];

        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)->get($cityWebsite);
            
            if (!$response->successful()) {
                return null;
            }

            $html = $response->body();

            // Direct Granicus link
            if (preg_match('/https?:\/\/([a-z0-9-]+)\.granicus\.com[^"\'>\s]*/i', $html, $match)) {
                return "https://{$match[1]}.granicus.com";
            }

            // Look for ViewPublisher links
            if (preg_match('/href=["\']([^"\']*ViewPublisher\.php[^"\']*)["\']/', $html, $match)) {
                $publisherUrl = $match[1];
                if (preg_match('/https?:\/\/([a-z0-9-]+)\.granicus\.com/i', $publisherUrl, $hostMatch)) {
                    return "https://{$hostMatch[1]}.granicus.com";
                }
            }

        } catch (Exception $e) {
            Log::warning('GranicusMedia: Failed to scan city website', [
                'url' => $cityWebsite,
                'error' => $e->getMessage(),
            ]);
        }

        return null;
    }

    /**
     * Parse publisher page to extract name and metadata
     */
    private function parsePublisherPage(string $html, int $viewId, string $baseUrl): ?array
    {
        // Extract title
        preg_match('/<title>([^<]+)<\/title>/i', $html, $titleMatch);
        $title = isset($titleMatch[1]) ? trim(strip_tags($titleMatch[1])) : null;

        // Extract h1 or main heading
        preg_match('/<h1[^>]*>([^<]+)<\/h1>/i', $html, $h1Match);
        $heading = isset($h1Match[1]) ? trim(strip_tags($h1Match[1])) : null;

        $name = $heading ?? $title ?? "Channel {$viewId}";

        // Remove common suffixes
        $name = preg_replace('/\s*-\s*Granicus.*$/i', '', $name);
        $name = preg_replace('/\s*\|\s*Granicus.*$/i', '', $name);

        if (empty($name) || strlen($name) < 3) {
            return null;
        }

        return [
            'view_id' => $viewId,
            'name' => $name,
            'url' => "{$baseUrl}/ViewPublisher.php?view_id={$viewId}",
        ];
    }

    /**
     * Extract RSS links from HTML page
     */
    private function extractRssLinksFromHtml(string $html, string $baseUrl): array
    {
        $feeds = [];

        // Look for <link rel="alternate" type="application/rss+xml">
        preg_match_all(
            '/<link[^>]*rel=["\']alternate["\'][^>]*type=["\']application\/rss\+xml["\'][^>]*href=["\']([^"\']+)["\'][^>]*>/i',
            $html,
            $linkMatches
        );

        foreach ($linkMatches[1] ?? [] as $feedUrl) {
            $feeds[] = [
                'type' => 'link_alternate',
                'url' => $this->makeAbsoluteUrl($feedUrl, $baseUrl),
            ];
        }

        // Look for href containing rss, MediaRSS, feeds
        preg_match_all(
            '/href=["\']([^"\']*(?:rss|MediaRSS|feeds)[^"\']*)["\']/',
            $html,
            $hrefMatches,
            PREG_SET_ORDER
        );

        foreach ($hrefMatches as $match) {
            $url = $this->makeAbsoluteUrl($match[1], $baseUrl);
            if (!in_array($url, array_column($feeds, 'url'))) {
                $feeds[] = [
                    'type' => 'href_rss',
                    'url' => $url,
                ];
            }
        }

        return $feeds;
    }

    /**
     * Test if a URL is a valid RSS feed
     */
    private function testRssFeed(string $url): bool
    {
        try {
            $response = Http::timeout(10)->get($url);

            if (!$response->successful()) {
                return false;
            }

            $contentType = $response->header('Content-Type') ?? '';
            $body = $response->body();

            // Check content type
            if (str_contains($contentType, 'xml') || str_contains($contentType, 'rss')) {
                return true;
            }

            // Check if body looks like XML/RSS
            if (str_starts_with(trim($body), '<?xml') || str_contains($body, '<rss') || str_contains($body, '<feed')) {
                return true;
            }

            return false;

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Transform RSS item to CivicContentItem format
     */
    private function transformRssItem(\SimpleXMLElement $item, string $feedUrl): array
    {
        $title = (string) $item->title;
        $link = (string) $item->link;
        $description = (string) $item->description;
        $pubDate = !empty((string) $item->pubDate)
            ? Carbon::parse((string) $item->pubDate)
            : null;
        $guid = (string) ($item->guid ?? $link ?? $title);

        // Determine content type
        $contentType = CivicContentItem::TYPE_MEETING;
        if (str_contains(strtolower($title . $description), 'agenda')) {
            $contentType = CivicContentItem::TYPE_AGENDA;
        }

        // Try to extract meeting date from title
        $eventDate = $this->extractDateFromTitle($title) ?? $pubDate;

        // Clean description
        $cleanDescription = strip_tags($description);
        $cleanDescription = html_entity_decode($cleanDescription);
        $cleanDescription = trim($cleanDescription);

        return [
            'content_type' => $contentType,
            'external_id' => md5($guid),
            'title' => html_entity_decode($title),
            'description' => $cleanDescription,
            'url' => $link,
            'published_at' => $pubDate,
            'event_date' => $eventDate,
            'category' => CivicContentItem::CATEGORY_GOVERNMENT,
            'subcategory' => 'meeting_video',
            'raw_data' => [
                'source_feed' => $feedUrl,
                'guid' => $guid,
            ],
            'content_hash' => CivicContentItem::generateHash($title, $link, $guid),
        ];
    }

    /**
     * Enhance item with Media RSS content
     */
    private function enhanceWithMediaContent(\SimpleXMLElement $item, \SimpleXMLElement $mediaContent): array
    {
        $enhancements = [];

        // Get video URL
        if ($mediaContent->content) {
            $attrs = $mediaContent->content->attributes();
            if ($attrs && isset($attrs['url'])) {
                $enhancements['video_url'] = (string) $attrs['url'];
            }
        }

        // Get thumbnail
        if ($mediaContent->thumbnail) {
            $attrs = $mediaContent->thumbnail->attributes();
            if ($attrs && isset($attrs['url'])) {
                $enhancements['thumbnail_url'] = (string) $attrs['url'];
            }
        }

        // Get duration
        if ($mediaContent->content) {
            $attrs = $mediaContent->content->attributes();
            if ($attrs && isset($attrs['duration'])) {
                $enhancements['duration_seconds'] = (int) $attrs['duration'];
            }
        }

        return $enhancements;
    }

    /**
     * Extract date from meeting title
     */
    private function extractDateFromTitle(string $title): ?Carbon
    {
        // Common patterns: "City Council - January 15, 2025"
        $patterns = [
            '/(\w+\s+\d{1,2},?\s*\d{4})/i',
            '/(\d{1,2}\/\d{1,2}\/\d{4})/',
            '/(\d{4}-\d{2}-\d{2})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $title, $match)) {
                try {
                    return Carbon::parse($match[1]);
                } catch (Exception $e) {
                    continue;
                }
            }
        }

        return null;
    }

    /**
     * Check if response is an error page
     */
    private function isErrorPage(string $html): bool
    {
        $errorIndicators = [
            'page not found',
            '404 error',
            'does not exist',
            'no longer available',
            'invalid view',
        ];

        $htmlLower = strtolower($html);

        foreach ($errorIndicators as $indicator) {
            if (str_contains($htmlLower, $indicator)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Normalize Granicus host URL
     */
    private function normalizeHost(string $host): string
    {
        $host = rtrim($host, '/');

        if (!str_starts_with($host, 'http')) {
            $host = "https://{$host}";
        }

        return $host;
    }

    /**
     * Make URL absolute
     */
    private function makeAbsoluteUrl(string $url, string $baseUrl): string
    {
        if (str_starts_with($url, 'http')) {
            return $url;
        }

        if (str_starts_with($url, '//')) {
            return "https:{$url}";
        }

        if (str_starts_with($url, '/')) {
            return rtrim($baseUrl, '/') . $url;
        }

        return rtrim($baseUrl, '/') . '/' . $url;
    }

    /**
     * Create a CivicSource for a Granicus Media site
     */
    public function createSourceFromHost(
        string $granicusHost,
        string $name,
        string $regionId,
        string $platformId
    ): array {
        $publishers = $this->discoverPublishers($granicusHost);
        $allFeeds = [];

        foreach ($publishers as $publisher) {
            $feeds = $this->discoverFeedsForPublisher($granicusHost, $publisher['view_id']);
            foreach ($feeds as $feed) {
                $feed['publisher_name'] = $publisher['name'];
                $feed['view_id'] = $publisher['view_id'];
                $allFeeds[] = $feed;
            }
        }

        return [
            'region_id' => $regionId,
            'platform_id' => $platformId,
            'name' => $name,
            'source_type' => 'rss',
            'entity_type' => 'city',
            'base_url' => $granicusHost,
            'available_feeds' => $allFeeds,
            'config' => [
                'publishers' => $publishers,
            ],
            'poll_interval_minutes' => 120,
            'is_enabled' => true,
            'auto_discovered' => false,
            'discovered_at' => now(),
        ];
    }
}
