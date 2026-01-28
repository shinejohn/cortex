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
 * Nixle Service
 * 
 * Handles integration with Nixle (Everbridge) public safety alert system.
 * Nixle provides alerts from police, fire, and emergency services.
 * 
 * URL Patterns:
 * - By ZIP: https://local.nixle.com/zipcode/{zipcode}/
 * - By City: https://local.nixle.com/city/{state}/{city}/
 * - RSS: https://rss.nixle.com/pubs/feeds/latest/{agency_id}/
 */
class NixleService
{
    private const BASE_URL = 'https://local.nixle.com';
    private const RSS_BASE_URL = 'https://rss.nixle.com';
    private const REQUEST_TIMEOUT = 30;

    /**
     * Fetch alerts for a ZIP code by scraping the Nixle page
     */
    public function fetchAlertsByZipCode(string $zipCode): Collection
    {
        $url = self::BASE_URL . "/zipcode/{$zipCode}/";

        Log::info('Nixle: Fetching alerts by ZIP', [
            'zip_code' => $zipCode,
            'url' => $url,
        ]);

        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->get($url);

            if (!$response->successful()) {
                throw new Exception("HTTP {$response->status()}");
            }

            $html = $response->body();
            $alerts = $this->parseAlertsFromHtml($html, $zipCode);

            // Also get agencies for this ZIP
            $agencies = $this->parseAgenciesFromHtml($html);

            Log::info('Nixle: Alerts fetched by ZIP', [
                'zip_code' => $zipCode,
                'alert_count' => $alerts->count(),
                'agency_count' => count($agencies),
            ]);

            return $alerts;

        } catch (Exception $e) {
            Log::error('Nixle: Failed to fetch by ZIP', [
                'zip_code' => $zipCode,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Fetch alerts from agency RSS feed
     */
    public function fetchAlertsFromRss(string $agencyId): Collection
    {
        $url = self::RSS_BASE_URL . "/pubs/feeds/latest/{$agencyId}/";

        Log::info('Nixle: Fetching alerts from RSS', [
            'agency_id' => $agencyId,
            'url' => $url,
        ]);

        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->get($url);

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

            foreach ($xml->channel->item ?? [] as $item) {
                $items->push($this->transformRssItem($item, $agencyId));
            }

            Log::info('Nixle: RSS alerts fetched', [
                'agency_id' => $agencyId,
                'count' => $items->count(),
            ]);

            return $items;

        } catch (Exception $e) {
            Log::error('Nixle: Failed to fetch RSS', [
                'agency_id' => $agencyId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Discover agencies serving a ZIP code
     */
    public function discoverAgencies(string $zipCode): array
    {
        $url = self::BASE_URL . "/agency_search/?cleanAddress={$zipCode}";

        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)->get($url);

            if (!$response->successful()) {
                return [];
            }

            return $this->parseAgenciesFromHtml($response->body());

        } catch (Exception $e) {
            Log::warning('Nixle: Agency discovery failed', [
                'zip_code' => $zipCode,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Get cities/areas near a ZIP code
     */
    public function getNearbyAreas(string $zipCode): array
    {
        $url = self::BASE_URL . "/zipcode/{$zipCode}/";

        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)->get($url);

            if (!$response->successful()) {
                return [];
            }

            return $this->parseNearbyAreasFromHtml($response->body());

        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Collect all content from a Nixle source
     */
    public function collectFromSource(CivicSource $source): array
    {
        $items = [];
        $errors = [];

        // If we have an RSS feed URL (agency-specific), use that
        if (!empty($source->rss_feed_url) && !empty($source->agency_id)) {
            try {
                $rssAlerts = $this->fetchAlertsFromRss($source->agency_id);
                foreach ($rssAlerts as $alert) {
                    $items[] = $alert;
                }
            } catch (Exception $e) {
                $errors[] = "RSS: {$e->getMessage()}";
            }
        }

        // Also scrape by ZIP codes if available
        $zipCodes = $source->getZipCodesArray();
        foreach ($zipCodes as $zipCode) {
            try {
                $zipAlerts = $this->fetchAlertsByZipCode($zipCode);
                foreach ($zipAlerts as $alert) {
                    // Add ZIP code to alert data
                    $alert['zip_code'] = $zipCode;
                    $items[] = $alert;
                }
            } catch (Exception $e) {
                $errors[] = "ZIP {$zipCode}: {$e->getMessage()}";
            }
        }

        // Deduplicate by content hash
        $items = collect($items)->unique('content_hash')->values()->toArray();

        if (!empty($errors)) {
            Log::warning('Nixle: Collection completed with errors', [
                'source_id' => $source->id,
                'errors' => $errors,
                'items_collected' => count($items),
            ]);
        }

        return $items;
    }

    /**
     * Parse alerts from Nixle HTML page
     */
    private function parseAlertsFromHtml(string $html, string $zipCode): Collection
    {
        $alerts = collect();

        // Find individual alert links
        // Pattern: /alert/{alert_id}/
        preg_match_all(
            '/<a[^>]*href=["\']\/alert\/(\d+)\/["\'][^>]*>(.*?)<\/a>/is',
            $html,
            $matches,
            PREG_SET_ORDER
        );

        foreach ($matches as $match) {
            $alertId = $match[1];
            $alertTitle = strip_tags($match[2]);

            if (empty($alertTitle) || strlen($alertTitle) < 5) {
                continue;
            }

            // Try to fetch full alert details
            $alertData = $this->fetchAlertDetails($alertId);

            if ($alertData) {
                $alerts->push($alertData);
            } else {
                // Create basic alert from link
                $alerts->push([
                    'content_type' => CivicContentItem::TYPE_ALERT,
                    'external_id' => $alertId,
                    'title' => trim($alertTitle),
                    'url' => self::BASE_URL . "/alert/{$alertId}/",
                    'published_at' => now(),
                    'category' => CivicContentItem::CATEGORY_PUBLIC_SAFETY,
                    'alert_type' => 'alert',
                    'content_hash' => CivicContentItem::generateHash($alertTitle, null, $alertId),
                ]);
            }
        }

        return $alerts;
    }

    /**
     * Fetch full alert details
     */
    private function fetchAlertDetails(string $alertId): ?array
    {
        $url = self::BASE_URL . "/alert/{$alertId}/";

        try {
            $response = Http::timeout(15)->get($url);

            if (!$response->successful()) {
                return null;
            }

            return $this->parseAlertDetailPage($response->body(), $alertId);

        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Parse alert detail page
     */
    private function parseAlertDetailPage(string $html, string $alertId): ?array
    {
        // Extract title
        preg_match('/<h1[^>]*class=["\'][^"\']*title[^"\']*["\'][^>]*>(.*?)<\/h1>/is', $html, $titleMatch);
        $title = isset($titleMatch[1]) ? strip_tags(trim($titleMatch[1])) : null;

        if (empty($title)) {
            preg_match('/<title>(.*?)<\/title>/is', $html, $titleMatch);
            $title = isset($titleMatch[1]) ? strip_tags(trim($titleMatch[1])) : 'Nixle Alert';
        }

        // Extract description/content
        preg_match('/<div[^>]*class=["\'][^"\']*message-body[^"\']*["\'][^>]*>(.*?)<\/div>/is', $html, $contentMatch);
        $content = isset($contentMatch[1]) ? strip_tags(trim($contentMatch[1])) : null;

        // Extract agency name
        preg_match('/<div[^>]*class=["\'][^"\']*agency[^"\']*["\'][^>]*>(.*?)<\/div>/is', $html, $agencyMatch);
        $agency = isset($agencyMatch[1]) ? strip_tags(trim($agencyMatch[1])) : null;

        // Extract date
        preg_match('/(\d{1,2}\/\d{1,2}\/\d{4}|\w+\s+\d{1,2},?\s*\d{4})/', $html, $dateMatch);
        $publishedAt = isset($dateMatch[1]) ? Carbon::parse($dateMatch[1]) : now();

        // Determine alert type from content/title
        $alertType = $this->determineAlertType($title . ' ' . ($content ?? ''));

        // Determine urgency and severity
        $urgency = $this->determineUrgency($title . ' ' . ($content ?? ''));
        $severity = $this->determineSeverity($title . ' ' . ($content ?? ''));

        return [
            'content_type' => CivicContentItem::TYPE_ALERT,
            'external_id' => $alertId,
            'title' => $title,
            'description' => $content,
            'url' => self::BASE_URL . "/alert/{$alertId}/",
            'published_at' => $publishedAt,
            'category' => CivicContentItem::CATEGORY_PUBLIC_SAFETY,
            'alert_type' => $alertType,
            'urgency' => $urgency,
            'severity' => $severity,
            'raw_data' => [
                'agency' => $agency,
            ],
            'content_hash' => CivicContentItem::generateHash($title, null, $alertId),
        ];
    }

    /**
     * Parse agencies from HTML
     */
    private function parseAgenciesFromHtml(string $html): array
    {
        $agencies = [];

        // Look for agency links
        preg_match_all(
            '/<a[^>]*href=["\']\/([a-z0-9-]+)["\'][^>]*class=["\'][^"\']*agency[^"\']*["\'][^>]*>(.*?)<\/a>/is',
            $html,
            $matches,
            PREG_SET_ORDER
        );

        foreach ($matches as $match) {
            $agencies[] = [
                'slug' => $match[1],
                'name' => strip_tags(trim($match[2])),
            ];
        }

        // Also look for agency links in different format
        preg_match_all(
            '/<a[^>]*href=["\']\/([\w-]+)["\'][^>]*>(City of [^<]+|[\w\s]+ Police[^<]*|[\w\s]+ Sheriff[^<]*)<\/a>/is',
            $html,
            $altMatches,
            PREG_SET_ORDER
        );

        foreach ($altMatches as $match) {
            if (!in_array($match[1], array_column($agencies, 'slug'))) {
                $agencies[] = [
                    'slug' => $match[1],
                    'name' => strip_tags(trim($match[2])),
                ];
            }
        }

        return $agencies;
    }

    /**
     * Parse nearby areas from HTML
     */
    private function parseNearbyAreasFromHtml(string $html): array
    {
        $areas = [
            'cities' => [],
            'zip_codes' => [],
            'counties' => [],
        ];

        // Find cities
        preg_match_all(
            '/href=["\']\/city\/([a-z]{2})\/([a-z-]+)\/["\']>([^<]+)</is',
            $html,
            $cityMatches,
            PREG_SET_ORDER
        );

        foreach ($cityMatches as $match) {
            $areas['cities'][] = [
                'state' => strtoupper($match[1]),
                'slug' => $match[2],
                'name' => trim($match[3]),
            ];
        }

        // Find ZIP codes
        preg_match_all(
            '/href=["\']\/zipcode\/(\d{5})\/["\']>([^<]+)</is',
            $html,
            $zipMatches,
            PREG_SET_ORDER
        );

        foreach ($zipMatches as $match) {
            $areas['zip_codes'][] = [
                'zip_code' => $match[1],
                'name' => trim($match[2]),
            ];
        }

        // Find counties
        preg_match_all(
            '/href=["\']\/county\/([a-z]{2})\/([a-z-]+)\/["\']>([^<]+)</is',
            $html,
            $countyMatches,
            PREG_SET_ORDER
        );

        foreach ($countyMatches as $match) {
            $areas['counties'][] = [
                'state' => strtoupper($match[1]),
                'slug' => $match[2],
                'name' => trim($match[3]),
            ];
        }

        return $areas;
    }

    /**
     * Transform RSS item to CivicContentItem format
     */
    private function transformRssItem(\SimpleXMLElement $item, string $agencyId): array
    {
        $title = (string) $item->title;
        $link = (string) $item->link;
        $description = (string) $item->description;
        $pubDate = !empty((string) $item->pubDate)
            ? Carbon::parse((string) $item->pubDate)
            : null;

        // Extract alert ID from link
        preg_match('/\/alert\/(\d+)\//', $link, $match);
        $alertId = $match[1] ?? md5($link);

        // Determine type and urgency
        $fullText = $title . ' ' . $description;
        $alertType = $this->determineAlertType($fullText);
        $urgency = $this->determineUrgency($fullText);
        $severity = $this->determineSeverity($fullText);

        return [
            'content_type' => CivicContentItem::TYPE_ALERT,
            'external_id' => $alertId,
            'title' => $title,
            'description' => strip_tags($description),
            'url' => $link,
            'published_at' => $pubDate,
            'category' => CivicContentItem::CATEGORY_PUBLIC_SAFETY,
            'alert_type' => $alertType,
            'urgency' => $urgency,
            'severity' => $severity,
            'raw_data' => [
                'agency_id' => $agencyId,
            ],
            'content_hash' => CivicContentItem::generateHash($title, null, $alertId),
        ];
    }

    /**
     * Determine alert type from content
     */
    private function determineAlertType(string $text): string
    {
        $textLower = strtolower($text);

        if (preg_match('/emergency|urgent|immediate|evacuate/i', $text)) {
            return 'alert';
        }
        if (preg_match('/advisory|notice|reminder|information/i', $text)) {
            return 'advisory';
        }
        if (preg_match('/community|event|meeting|closure/i', $text)) {
            return 'community';
        }

        return 'alert';
    }

    /**
     * Determine urgency level
     */
    private function determineUrgency(string $text): string
    {
        $textLower = strtolower($text);

        if (preg_match('/immediate|emergency|evacuate|active shooter|amber alert/i', $text)) {
            return 'Immediate';
        }
        if (preg_match('/expected|warning|threat|severe/i', $text)) {
            return 'Expected';
        }
        if (preg_match('/future|upcoming|planned/i', $text)) {
            return 'Future';
        }

        return 'Unknown';
    }

    /**
     * Determine severity level
     */
    private function determineSeverity(string $text): string
    {
        $textLower = strtolower($text);

        if (preg_match('/extreme|life-threatening|evacuate|active shooter/i', $text)) {
            return 'Extreme';
        }
        if (preg_match('/severe|danger|warning|major/i', $text)) {
            return 'Severe';
        }
        if (preg_match('/moderate|caution|advisory/i', $text)) {
            return 'Moderate';
        }

        return 'Minor';
    }

    /**
     * Create a CivicSource for Nixle coverage
     */
    public function createSourceForZipCodes(
        array $zipCodes,
        string $name,
        string $regionId,
        string $platformId
    ): array {
        return [
            'region_id' => $regionId,
            'platform_id' => $platformId,
            'name' => $name,
            'source_type' => CivicSource::TYPE_SCRAPE,
            'entity_type' => CivicSource::ENTITY_POLICE,
            'zip_codes' => implode(',', $zipCodes),
            'poll_interval_minutes' => 30, // More frequent for alerts
            'is_enabled' => true,
            'auto_discovered' => false,
            'discovered_at' => now(),
        ];
    }
}
