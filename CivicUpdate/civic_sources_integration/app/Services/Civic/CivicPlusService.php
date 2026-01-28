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
use SimpleXMLElement;

/**
 * CivicPlus Service
 * 
 * Handles integration with CivicPlus municipal websites.
 * CivicPlus provides RSS feeds for Agenda Center, Alert Center, Calendar, News Flash, etc.
 * 
 * RSS Discovery: {site}/rss.aspx
 */
class CivicPlusService
{
    private const REQUEST_TIMEOUT = 30;

    /**
     * Discover available RSS feeds for a CivicPlus site
     */
    public function discoverFeeds(string $baseUrl): array
    {
        $rssUrl = rtrim($baseUrl, '/') . '/rss.aspx';

        Log::info('CivicPlus: Discovering feeds', ['url' => $rssUrl]);

        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->get($rssUrl);

            if (!$response->successful()) {
                Log::warning('CivicPlus: RSS page not accessible', [
                    'url' => $rssUrl,
                    'status' => $response->status(),
                ]);
                return [];
            }

            $html = $response->body();
            $feeds = $this->parseRssPage($html, $baseUrl);

            Log::info('CivicPlus: Feeds discovered', [
                'url' => $rssUrl,
                'feed_count' => count($feeds),
            ]);

            return $feeds;

        } catch (Exception $e) {
            Log::error('CivicPlus: Feed discovery failed', [
                'url' => $rssUrl,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Parse the RSS page to extract available feeds
     */
    private function parseRssPage(string $html, string $baseUrl): array
    {
        $feeds = [];
        
        // Look for RSS feed links in the page
        // CivicPlus format: /rss.aspx?CID=### or /rss.aspx?AMID=###
        preg_match_all(
            '/<a[^>]*href=["\']([^"\']*rss\.aspx[^"\']*)["\'][^>]*>([^<]*)</i',
            $html,
            $matches,
            PREG_SET_ORDER
        );

        foreach ($matches as $match) {
            $feedUrl = $match[1];
            $feedName = trim(strip_tags($match[2]));

            // Make URL absolute if relative
            if (!str_starts_with($feedUrl, 'http')) {
                $feedUrl = rtrim($baseUrl, '/') . '/' . ltrim($feedUrl, '/');
            }

            // Determine feed type
            $feedType = $this->determineFeedType($feedUrl, $feedName);

            $feeds[] = [
                'url' => $feedUrl,
                'name' => $feedName ?: $feedType,
                'type' => $feedType,
            ];
        }

        // Also try standard endpoints
        $standardFeeds = [
            'agenda' => '/rss.aspx?AMID=1',
            'alert' => '/rss.aspx?CID=AlertCenter',
            'calendar' => '/rss.aspx?CID=Calendar',
            'news' => '/rss.aspx?CID=NewsFlash',
            'jobs' => '/rss.aspx?CID=Jobs',
        ];

        foreach ($standardFeeds as $type => $endpoint) {
            $feedUrl = rtrim($baseUrl, '/') . $endpoint;
            
            // Check if we already found this feed
            $exists = collect($feeds)->contains(fn($f) => 
                str_contains($f['url'], $endpoint) || $f['type'] === $type
            );

            if (!$exists) {
                // Test if the feed exists
                if ($this->testFeed($feedUrl)) {
                    $feeds[] = [
                        'url' => $feedUrl,
                        'name' => ucfirst($type) . ' Feed',
                        'type' => $type,
                    ];
                }
            }
        }

        return $feeds;
    }

    /**
     * Determine feed type from URL or name
     */
    private function determineFeedType(string $url, string $name): string
    {
        $urlLower = strtolower($url);
        $nameLower = strtolower($name);

        if (str_contains($urlLower, 'amid') || str_contains($nameLower, 'agenda')) {
            return 'agenda';
        }
        if (str_contains($urlLower, 'alertcenter') || str_contains($nameLower, 'alert')) {
            return 'alert';
        }
        if (str_contains($urlLower, 'calendar') || str_contains($nameLower, 'calendar')) {
            return 'calendar';
        }
        if (str_contains($urlLower, 'newsflash') || str_contains($nameLower, 'news')) {
            return 'news';
        }
        if (str_contains($urlLower, 'jobs') || str_contains($nameLower, 'job')) {
            return 'jobs';
        }

        return 'general';
    }

    /**
     * Test if a feed URL is accessible and returns valid RSS
     */
    public function testFeed(string $feedUrl): bool
    {
        try {
            $response = Http::timeout(10)
                ->get($feedUrl);

            if (!$response->successful()) {
                return false;
            }

            // Check if it's valid XML
            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($response->body());
            libxml_use_internal_errors(false);

            return $xml !== false;

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Fetch items from an RSS feed
     */
    public function fetchFeed(string $feedUrl, string $feedType = 'general'): Collection
    {
        Log::info('CivicPlus: Fetching feed', [
            'url' => $feedUrl,
            'type' => $feedType,
        ]);

        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->get($feedUrl);

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

            // Parse RSS items
            foreach ($xml->channel->item ?? [] as $item) {
                $items->push($this->transformRssItem($item, $feedType, $feedUrl));
            }

            // Also try Atom format
            foreach ($xml->entry ?? [] as $entry) {
                $items->push($this->transformAtomEntry($entry, $feedType, $feedUrl));
            }

            Log::info('CivicPlus: Feed fetched', [
                'url' => $feedUrl,
                'items' => $items->count(),
            ]);

            return $items;

        } catch (Exception $e) {
            Log::error('CivicPlus: Failed to fetch feed', [
                'url' => $feedUrl,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Collect all content from a CivicPlus source
     */
    public function collectFromSource(CivicSource $source): array
    {
        $items = [];
        $errors = [];

        $availableFeeds = $source->available_feeds ?? [];

        // If no feeds discovered yet, try to discover them
        if (empty($availableFeeds) && !empty($source->base_url)) {
            $availableFeeds = $this->discoverFeeds($source->base_url);
            
            // Update the source with discovered feeds
            if (!empty($availableFeeds)) {
                $source->update(['available_feeds' => $availableFeeds]);
            }
        }

        // If we have a direct RSS URL, use that
        if (!empty($source->rss_feed_url)) {
            try {
                $feedItems = $this->fetchFeed($source->rss_feed_url, 'general');
                foreach ($feedItems as $item) {
                    $items[] = $item;
                }
            } catch (Exception $e) {
                $errors[] = "RSS Feed: {$e->getMessage()}";
            }
        }

        // Fetch from all discovered feeds
        foreach ($availableFeeds as $feed) {
            try {
                $feedItems = $this->fetchFeed($feed['url'], $feed['type'] ?? 'general');
                foreach ($feedItems as $item) {
                    $items[] = $item;
                }
            } catch (Exception $e) {
                $errors[] = "{$feed['name']}: {$e->getMessage()}";
            }
        }

        if (!empty($errors)) {
            Log::warning('CivicPlus: Collection completed with errors', [
                'source_id' => $source->id,
                'errors' => $errors,
                'items_collected' => count($items),
            ]);
        }

        return $items;
    }

    /**
     * Transform RSS item to CivicContentItem format
     */
    private function transformRssItem(SimpleXMLElement $item, string $feedType, string $feedUrl): array
    {
        $title = (string) $item->title;
        $link = (string) $item->link;
        $description = (string) $item->description;
        $pubDate = !empty((string) $item->pubDate) 
            ? Carbon::parse((string) $item->pubDate) 
            : null;

        // Determine content type based on feed type
        $contentType = match ($feedType) {
            'agenda' => CivicContentItem::TYPE_AGENDA,
            'alert' => CivicContentItem::TYPE_ALERT,
            'calendar' => CivicContentItem::TYPE_EVENT,
            'news' => CivicContentItem::TYPE_NEWS,
            default => CivicContentItem::TYPE_NEWS,
        };

        // Determine category
        $category = match ($feedType) {
            'agenda' => CivicContentItem::CATEGORY_GOVERNMENT,
            'alert' => CivicContentItem::CATEGORY_PUBLIC_SAFETY,
            'calendar' => CivicContentItem::CATEGORY_COMMUNITY,
            default => CivicContentItem::CATEGORY_COMMUNITY,
        };

        // Extract event date if present (for calendar items)
        $eventDate = null;
        if ($feedType === 'calendar') {
            // Try to extract date from title or description
            $eventDate = $this->extractEventDate($title, $description);
        }

        // Clean up description
        $cleanDescription = strip_tags($description);
        $cleanDescription = html_entity_decode($cleanDescription);
        $cleanDescription = trim($cleanDescription);

        return [
            'content_type' => $contentType,
            'external_id' => md5($link), // Generate ID from URL
            'title' => html_entity_decode($title),
            'description' => $cleanDescription,
            'url' => $link,
            'published_at' => $pubDate,
            'event_date' => $eventDate,
            'category' => $category,
            'subcategory' => $feedType,
            'raw_data' => [
                'source_feed' => $feedUrl,
                'feed_type' => $feedType,
            ],
            'content_hash' => CivicContentItem::generateHash($title, $link),
        ];
    }

    /**
     * Transform Atom entry to CivicContentItem format
     */
    private function transformAtomEntry(SimpleXMLElement $entry, string $feedType, string $feedUrl): array
    {
        $title = (string) $entry->title;
        
        // Get link (Atom uses href attribute)
        $link = '';
        foreach ($entry->link as $linkEl) {
            if ((string) $linkEl['rel'] === 'alternate' || empty((string) $linkEl['rel'])) {
                $link = (string) $linkEl['href'];
                break;
            }
        }

        $description = (string) ($entry->summary ?? $entry->content ?? '');
        $pubDate = !empty((string) $entry->updated)
            ? Carbon::parse((string) $entry->updated)
            : null;

        $contentType = match ($feedType) {
            'agenda' => CivicContentItem::TYPE_AGENDA,
            'alert' => CivicContentItem::TYPE_ALERT,
            'calendar' => CivicContentItem::TYPE_EVENT,
            'news' => CivicContentItem::TYPE_NEWS,
            default => CivicContentItem::TYPE_NEWS,
        };

        $category = match ($feedType) {
            'agenda' => CivicContentItem::CATEGORY_GOVERNMENT,
            'alert' => CivicContentItem::CATEGORY_PUBLIC_SAFETY,
            'calendar' => CivicContentItem::CATEGORY_COMMUNITY,
            default => CivicContentItem::CATEGORY_COMMUNITY,
        };

        return [
            'content_type' => $contentType,
            'external_id' => md5($link ?: $title),
            'title' => html_entity_decode($title),
            'description' => strip_tags(html_entity_decode($description)),
            'url' => $link,
            'published_at' => $pubDate,
            'category' => $category,
            'subcategory' => $feedType,
            'raw_data' => [
                'source_feed' => $feedUrl,
                'feed_type' => $feedType,
            ],
            'content_hash' => CivicContentItem::generateHash($title, $link),
        ];
    }

    /**
     * Try to extract event date from title or description
     */
    private function extractEventDate(string $title, string $description): ?Carbon
    {
        $text = $title . ' ' . $description;

        // Common date patterns
        $patterns = [
            // "January 15, 2025" or "Jan 15, 2025"
            '/([A-Z][a-z]{2,8})\s+(\d{1,2}),?\s*(\d{4})/i',
            // "01/15/2025" or "1/15/2025"
            '/(\d{1,2})\/(\d{1,2})\/(\d{4})/',
            // "2025-01-15"
            '/(\d{4})-(\d{2})-(\d{2})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                try {
                    return Carbon::parse($matches[0]);
                } catch (Exception $e) {
                    continue;
                }
            }
        }

        return null;
    }

    /**
     * Detect if a URL is a CivicPlus site
     */
    public function detectCivicPlus(string $url): bool
    {
        try {
            $response = Http::timeout(10)->get($url);

            if (!$response->successful()) {
                return false;
            }

            $html = strtolower($response->body());

            $signatures = [
                'civicplus',
                'civicengage',
                '/agendacenter',
                '/alertcenter',
                '/documentcenter',
                '/rss.aspx',
            ];

            foreach ($signatures as $signature) {
                if (str_contains($html, $signature)) {
                    return true;
                }
            }

            return false;

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Create a CivicSource from a CivicPlus site
     */
    public function createSourceFromSite(
        string $baseUrl,
        string $name,
        string $regionId,
        string $platformId
    ): array {
        $feeds = $this->discoverFeeds($baseUrl);

        return [
            'region_id' => $regionId,
            'platform_id' => $platformId,
            'name' => $name,
            'source_type' => CivicSource::TYPE_RSS,
            'entity_type' => CivicSource::ENTITY_CITY,
            'base_url' => $baseUrl,
            'rss_feed_url' => rtrim($baseUrl, '/') . '/rss.aspx',
            'available_feeds' => $feeds,
            'poll_interval_minutes' => 60,
            'is_enabled' => true,
            'auto_discovered' => false,
            'discovered_at' => now(),
        ];
    }
}
