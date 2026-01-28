<?php

declare(strict_types=1);

namespace App\Services\Civic;

use App\Models\CivicCollectionRun;
use App\Models\CivicContentItem;
use App\Models\CivicSource;
use App\Models\CivicSourcePlatform;
use App\Models\NewsArticle;
use App\Models\Region;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Civic Source Collection Service
 * 
 * Main orchestrator for collecting content from civic platforms (CivicPlus, Legistar, Nixle).
 * Integrates with the existing news workflow by creating NewsArticle records.
 */
class CivicSourceCollectionService
{
    public function __construct(
        private readonly LegistarService $legistarService,
        private readonly CivicPlusService $civicPlusService,
        private readonly NixleService $nixleService,
        private readonly GranicusMediaService $granicusMediaService
    ) {}

    /**
     * Collect content from all enabled civic sources for a region
     */
    public function collectForRegion(Region $region): array
    {
        Log::info('CivicCollection: Starting collection for region', [
            'region_id' => $region->id,
            'region_name' => $region->name,
        ]);

        $results = [
            'sources_processed' => 0,
            'items_collected' => 0,
            'items_new' => 0,
            'items_skipped' => 0,
            'errors' => [],
        ];

        // Get all enabled civic sources for this region
        $sources = CivicSource::forRegion($region)
            ->enabled()
            ->dueForCollection()
            ->with('platform')
            ->get();

        Log::info('CivicCollection: Found sources due for collection', [
            'region_id' => $region->id,
            'source_count' => $sources->count(),
        ]);

        foreach ($sources as $source) {
            try {
                $sourceResults = $this->collectFromSource($source);
                
                $results['sources_processed']++;
                $results['items_collected'] += $sourceResults['items_collected'];
                $results['items_new'] += $sourceResults['items_new'];
                $results['items_skipped'] += $sourceResults['items_skipped'];

            } catch (Exception $e) {
                $results['errors'][] = [
                    'source_id' => $source->id,
                    'source_name' => $source->name,
                    'error' => $e->getMessage(),
                ];

                Log::error('CivicCollection: Source collection failed', [
                    'source_id' => $source->id,
                    'source_name' => $source->name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('CivicCollection: Completed for region', [
            'region_id' => $region->id,
            'results' => $results,
        ]);

        return $results;
    }

    /**
     * Collect content from a single civic source
     */
    public function collectFromSource(CivicSource $source): array
    {
        Log::info('CivicCollection: Starting source collection', [
            'source_id' => $source->id,
            'source_name' => $source->name,
            'platform' => $source->platform->name ?? 'unknown',
        ]);

        // Start collection run
        $run = $source->markCollectionStarted();

        $results = [
            'items_collected' => 0,
            'items_new' => 0,
            'items_skipped' => 0,
        ];

        try {
            // Get raw items from the appropriate platform service
            $rawItems = $this->fetchFromPlatform($source);

            $results['items_collected'] = count($rawItems);

            // Store each item
            foreach ($rawItems as $itemData) {
                $stored = $this->storeContentItem($itemData, $source);
                
                if ($stored) {
                    $results['items_new']++;
                } else {
                    $results['items_skipped']++;
                }
            }

            // Update source and run
            $source->markCollectionCompleted($results['items_collected'], $results['items_new']);
            
            $run->update([
                'completed_at' => now(),
                'status' => 'completed',
                'items_found' => $results['items_collected'],
                'items_new' => $results['items_new'],
                'items_skipped' => $results['items_skipped'],
            ]);

            Log::info('CivicCollection: Source collection completed', [
                'source_id' => $source->id,
                'results' => $results,
            ]);

        } catch (Exception $e) {
            $source->markCollectionFailed($e->getMessage());
            
            $run->update([
                'completed_at' => now(),
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }

        return $results;
    }

    /**
     * Fetch raw items from the appropriate platform service
     */
    private function fetchFromPlatform(CivicSource $source): array
    {
        $platformName = $source->platform->name ?? '';

        return match ($platformName) {
            CivicSourcePlatform::LEGISTAR => $this->legistarService->collectFromSource($source),
            CivicSourcePlatform::CIVICPLUS => $this->civicPlusService->collectFromSource($source),
            CivicSourcePlatform::NIXLE => $this->nixleService->collectFromSource($source),
            'granicus_media' => $this->granicusMediaService->collectFromSource($source),
            default => throw new Exception("Unknown platform: {$platformName}"),
        };
    }

    /**
     * Store a content item (with deduplication)
     */
    private function storeContentItem(array $data, CivicSource $source): ?CivicContentItem
    {
        $contentHash = $data['content_hash'] ?? CivicContentItem::generateHash(
            $data['title'] ?? '',
            $data['url'] ?? null,
            $data['external_id'] ?? null
        );

        // Check for duplicate
        if (CivicContentItem::isDuplicate($contentHash, $source)) {
            return null;
        }

        // Create the content item
        return CivicContentItem::create([
            'civic_source_id' => $source->id,
            'region_id' => $source->region_id,
            'content_type' => $data['content_type'] ?? CivicContentItem::TYPE_NEWS,
            'external_id' => $data['external_id'] ?? null,
            'title' => $data['title'] ?? 'Untitled',
            'description' => $data['description'] ?? null,
            'full_content' => $data['full_content'] ?? null,
            'url' => $data['url'] ?? null,
            'published_at' => $data['published_at'] ?? now(),
            'event_date' => $data['event_date'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'category' => $data['category'] ?? null,
            'subcategory' => $data['subcategory'] ?? null,
            'tags' => $data['tags'] ?? null,
            'body_name' => $data['body_name'] ?? null,
            'meeting_type' => $data['meeting_type'] ?? null,
            'agenda_items' => $data['agenda_items'] ?? null,
            'attachments' => $data['attachments'] ?? null,
            'alert_type' => $data['alert_type'] ?? null,
            'urgency' => $data['urgency'] ?? null,
            'severity' => $data['severity'] ?? null,
            'raw_data' => $data['raw_data'] ?? null,
            'content_hash' => $contentHash,
            'processing_status' => CivicContentItem::STATUS_PENDING,
        ]);
    }

    /**
     * Process pending civic content items and create NewsArticles
     */
    public function processPendingItems(Region $region, int $limit = 50): array
    {
        Log::info('CivicCollection: Processing pending items', [
            'region_id' => $region->id,
            'limit' => $limit,
        ]);

        $results = [
            'processed' => 0,
            'articles_created' => 0,
            'skipped' => 0,
            'failed' => 0,
        ];

        $pendingItems = CivicContentItem::forRegion($region)
            ->pending()
            ->recent(14) // Only items from last 2 weeks
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();

        foreach ($pendingItems as $item) {
            try {
                $shouldProcess = $this->shouldProcessItem($item);

                if (!$shouldProcess) {
                    $item->markSkipped();
                    $results['skipped']++;
                    continue;
                }

                $article = $this->createNewsArticleFromItem($item, $region);

                if ($article) {
                    $item->markProcessed($article->id);
                    $results['articles_created']++;
                } else {
                    $item->markSkipped();
                    $results['skipped']++;
                }

                $results['processed']++;

            } catch (Exception $e) {
                $item->markFailed();
                $results['failed']++;

                Log::warning('CivicCollection: Failed to process item', [
                    'item_id' => $item->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('CivicCollection: Finished processing pending items', [
            'region_id' => $region->id,
            'results' => $results,
        ]);

        return $results;
    }

    /**
     * Determine if a civic content item should be processed into a news article
     */
    private function shouldProcessItem(CivicContentItem $item): bool
    {
        // Always process alerts (time-sensitive)
        if (in_array($item->content_type, [CivicContentItem::TYPE_ALERT, CivicContentItem::TYPE_ADVISORY])) {
            return $item->isValid(); // Not expired
        }

        // Process meetings/agendas if they're upcoming
        if (in_array($item->content_type, [CivicContentItem::TYPE_MEETING, CivicContentItem::TYPE_AGENDA])) {
            if ($item->event_date && $item->event_date->isPast()) {
                return false; // Skip past meetings
            }
            return true;
        }

        // Process legislation/matters
        if ($item->content_type === CivicContentItem::TYPE_MATTER) {
            return true;
        }

        // Skip items with very short titles
        if (strlen($item->title) < 10) {
            return false;
        }

        return true;
    }

    /**
     * Create a NewsArticle from a CivicContentItem
     */
    private function createNewsArticleFromItem(CivicContentItem $item, Region $region): ?NewsArticle
    {
        // Generate a news-friendly title if needed
        $title = $this->generateNewsTitle($item);

        // Generate content snippet
        $snippet = $item->getSummary();

        // Determine source type
        $sourceType = 'civic_' . $item->civicSource->platform->name;

        // Generate content hash for deduplication
        $contentHash = hash('sha256', $title . '|' . ($item->url ?? ''));

        // Check if article already exists in NewsArticle
        $exists = NewsArticle::where('content_hash', $contentHash)
            ->where('region_id', $region->id)
            ->exists();

        if ($exists) {
            return null;
        }

        // Create the news article
        return NewsArticle::create([
            'region_id' => $region->id,
            'source_type' => $sourceType,
            'source_name' => $item->civicSource->name,
            'title' => $title,
            'url' => $item->url,
            'content_snippet' => $snippet,
            'source_publisher' => $item->civicSource->name,
            'published_at' => $item->published_at,
            'metadata' => [
                'civic_content_id' => $item->id,
                'content_type' => $item->content_type,
                'category' => $item->category,
                'platform' => $item->civicSource->platform->name,
                'event_date' => $item->event_date?->toIso8601String(),
                'body_name' => $item->body_name,
                'alert_type' => $item->alert_type,
                'urgency' => $item->urgency,
            ],
            'content_hash' => $contentHash,
            'processed' => false,
        ]);
    }

    /**
     * Generate a news-friendly title from civic content
     */
    private function generateNewsTitle(CivicContentItem $item): string
    {
        $title = $item->title;

        // For meetings, make title more news-friendly
        if ($item->content_type === CivicContentItem::TYPE_MEETING) {
            if ($item->event_date) {
                $date = $item->event_date->format('F j');
                $bodyName = $item->body_name ?? 'Council';
                return "{$bodyName} Meeting Scheduled for {$date}";
            }
        }

        // For alerts, ensure urgency is conveyed
        if ($item->content_type === CivicContentItem::TYPE_ALERT) {
            if ($item->urgency === 'Immediate' && !str_contains(strtoupper($title), 'ALERT')) {
                return "ALERT: {$title}";
            }
        }

        return $title;
    }

    /**
     * Discover and create civic sources for a region
     */
    public function discoverSourcesForRegion(Region $region): array
    {
        Log::info('CivicCollection: Discovering sources for region', [
            'region_id' => $region->id,
            'region_name' => $region->name,
        ]);

        $discovered = [
            'legistar' => null,
            'civicplus' => [],
            'nixle' => null,
        ];

        // Get region details
        $cityName = $region->name;
        $state = $region->state ?? null;
        $zipCodes = $this->getRegionZipCodes($region);

        // Try to discover Legistar client
        $legistarClient = $this->legistarService->discoverClient($cityName, $state);
        if ($legistarClient) {
            $discovered['legistar'] = $this->createLegistarSource($region, $legistarClient);
        }

        // Try to detect CivicPlus from common municipal URL patterns
        $municipalUrls = $this->generateMunicipalUrls($cityName, $state);
        foreach ($municipalUrls as $url) {
            if ($this->civicPlusService->detectCivicPlus($url)) {
                $source = $this->createCivicPlusSource($region, $url, $cityName);
                if ($source) {
                    $discovered['civicplus'][] = $source;
                    break; // Found one, stop searching
                }
            }
        }

        // Create Nixle source for the region's ZIP codes
        if (!empty($zipCodes)) {
            $discovered['nixle'] = $this->createNixleSource($region, $zipCodes);
        }

        Log::info('CivicCollection: Discovery completed', [
            'region_id' => $region->id,
            'discovered' => [
                'legistar' => $discovered['legistar'] ? true : false,
                'civicplus' => count($discovered['civicplus']),
                'nixle' => $discovered['nixle'] ? true : false,
            ],
        ]);

        return $discovered;
    }

    /**
     * Create a Legistar source for a region
     */
    private function createLegistarSource(Region $region, string $clientName): ?CivicSource
    {
        $platform = CivicSourcePlatform::byName(CivicSourcePlatform::LEGISTAR);

        if (!$platform) {
            return null;
        }

        return CivicSource::create([
            'region_id' => $region->id,
            'platform_id' => $platform->id,
            'name' => "{$region->name} - Legistar",
            'source_type' => CivicSource::TYPE_API,
            'entity_type' => CivicSource::ENTITY_CITY,
            'api_endpoint' => "https://webapi.legistar.com/v1/{$clientName}",
            'api_client_name' => $clientName,
            'poll_interval_minutes' => 120,
            'is_enabled' => true,
            'is_verified' => false,
            'auto_discovered' => true,
            'discovered_at' => now(),
        ]);
    }

    /**
     * Create a CivicPlus source for a region
     */
    private function createCivicPlusSource(Region $region, string $baseUrl, string $cityName): ?CivicSource
    {
        $platform = CivicSourcePlatform::byName(CivicSourcePlatform::CIVICPLUS);

        if (!$platform) {
            return null;
        }

        $sourceData = $this->civicPlusService->createSourceFromSite(
            $baseUrl,
            "{$cityName} - CivicPlus",
            $region->id,
            $platform->id
        );

        return CivicSource::create($sourceData);
    }

    /**
     * Create a Nixle source for a region
     */
    private function createNixleSource(Region $region, array $zipCodes): ?CivicSource
    {
        $platform = CivicSourcePlatform::byName(CivicSourcePlatform::NIXLE);

        if (!$platform) {
            return null;
        }

        $sourceData = $this->nixleService->createSourceForZipCodes(
            $zipCodes,
            "{$region->name} - Nixle Alerts",
            $region->id,
            $platform->id
        );
        $sourceData['platform_id'] = $platform->id;

        return CivicSource::create($sourceData);
    }

    /**
     * Get ZIP codes for a region
     */
    private function getRegionZipCodes(Region $region): array
    {
        // Try to get from region's zip_codes field
        if (!empty($region->zip_codes)) {
            return array_map('trim', explode(',', $region->zip_codes));
        }

        // Try to get from related cities/communities
        if (method_exists($region, 'cities')) {
            return $region->cities()
                ->whereNotNull('geo_sw_postalcode')
                ->pluck('geo_sw_postalcode')
                ->unique()
                ->take(10)
                ->toArray();
        }

        return [];
    }

    /**
     * Generate common municipal URL patterns
     */
    private function generateMunicipalUrls(string $cityName, ?string $state): array
    {
        $normalized = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $cityName));
        $hyphenated = strtolower(str_replace(' ', '-', $cityName));
        $stateAbbr = strtolower($state ?? '');

        $patterns = [
            "https://www.{$normalized}.gov",
            "https://www.{$normalized}{$stateAbbr}.gov",
            "https://www.cityof{$normalized}.com",
            "https://www.cityof{$normalized}.org",
            "https://{$normalized}.gov",
            "https://{$hyphenated}.gov",
            "https://www.{$hyphenated}.gov",
        ];

        return array_unique($patterns);
    }

    /**
     * Get statistics for civic sources
     */
    public function getStatistics(Region $region): array
    {
        return [
            'total_sources' => CivicSource::forRegion($region)->count(),
            'enabled_sources' => CivicSource::forRegion($region)->enabled()->count(),
            'healthy_sources' => CivicSource::forRegion($region)->healthy()->count(),
            'total_items' => CivicContentItem::forRegion($region)->count(),
            'pending_items' => CivicContentItem::forRegion($region)->pending()->count(),
            'processed_items' => CivicContentItem::forRegion($region)->processed()->count(),
            'recent_alerts' => CivicContentItem::forRegion($region)->alerts()->recent(7)->count(),
            'upcoming_meetings' => CivicContentItem::forRegion($region)
                ->meetings()
                ->where('event_date', '>=', now())
                ->count(),
        ];
    }
}
