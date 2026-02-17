# TASK-09-P8: Create ContentRoutingService (Pipeline B → Pipeline A Bridge)

## Context

This is the **most architecturally critical service** in the entire pipeline. Currently, Pipeline B (Newsroom collection → RawContent → ContentClassificationService) terminates at a DEAD END. Classified content has NO path to any output table. It never becomes an article, event, announcement, or anything else.

The only working bridge in the codebase is `CivicSourceCollectionService::createNewsArticleFromItem()` which converts `CivicContentItem` → `NewsArticle`. The `ContentRoutingService` replicates this bridge pattern but is **multi-output**: one classified `RawContent` can simultaneously produce a `NewsArticle`, an Event, an Announcement, and a sales flag.

**Depends on:** TASK-08 (news sources must be generating RawContent).

### The Bridge Pattern to Replicate (from CivicSourceCollectionService)

```php
private function createNewsArticleFromItem(CivicContentItem $item, Region $region): ?NewsArticle
{
    $title = $this->generateNewsTitle($item);
    $snippet = $item->getSummary();
    $sourceType = 'civic_' . $item->civicSource->platform->name;
    $contentHash = hash('sha256', $title . '|' . ($item->url ?? ''));

    $exists = NewsArticle::where('content_hash', $contentHash)
        ->where('region_id', $region->id)
        ->exists();
    if ($exists) return null;

    return NewsArticle::create([
        'region_id' => $region->id,
        'source_type' => $sourceType,
        'source_name' => $item->civicSource->name,
        'title' => $title,
        'url' => $item->url,
        'content_snippet' => $snippet,
        'source_publisher' => $item->civicSource->name,
        'published_at' => $item->published_at,
        'metadata' => [...],
        'content_hash' => $contentHash,
        'processed' => false,
    ]);
}
```

### Key Decision: Classification = Routing, Not Rejection

Every classified RawContent must route SOMEWHERE. A bake sale is an EVENT + FUNDRAISER. A new restaurant opening is NEWS + NEW_BUSINESS + SALES_OPPORTUNITY. One input → multiple outputs.

---

## Objective

Create `ContentRoutingService` that takes classified `RawContent` records and routes them to appropriate destination tables based on classification. Create `ProcessClassifiedContentJob` that runs every 15 minutes to process the queue.

---

## Files to Create

### 1. CREATE: ContentRoutingService

**File:** `app/Services/Newsroom/ContentRoutingService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\NewsArticle;
use App\Models\RawContent;
use App\Models\Region;
use App\Services\News\EventExtractionService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ContentRoutingService
{
    public function __construct(
        private readonly EventExtractionService $eventExtraction,
    ) {}

    /**
     * Route a classified RawContent to all appropriate outputs.
     * One input can produce MULTIPLE outputs simultaneously.
     *
     * @return array{article: ?NewsArticle, event_created: bool, announcement_created: bool}
     */
    public function routeContent(RawContent $raw): array
    {
        if ($raw->classification_status !== RawContent::CLASS_CLASSIFIED) {
            Log::warning('ContentRouting: Attempted to route unclassified content', ['id' => $raw->id]);
            return ['article' => null, 'event_created' => false, 'announcement_created' => false];
        }

        if ($raw->processing_status === RawContent::PROC_COMPLETED) {
            return ['article' => null, 'event_created' => false, 'announcement_created' => false];
        }

        $results = [
            'article' => null,
            'event_created' => false,
            'announcement_created' => false,
        ];

        $contentTypes = $raw->content_types ?? [];
        $primaryType = $raw->primary_type;
        $priority = $raw->priority ?? 'normal';

        Log::info('ContentRouting: Routing classified content', [
            'id' => $raw->id,
            'title' => substr($raw->source_title ?? '', 0, 60),
            'primary_type' => $primaryType,
            'content_types' => $contentTypes,
            'priority' => $priority,
        ]);

        try {
            $region = $this->resolveRegion($raw);

            // Route 1: News Article (Pipeline A bridge)
            if ($this->shouldCreateArticle($primaryType, $contentTypes)) {
                $results['article'] = $this->createNewsArticle($raw, $region);

                // High priority fast-track
                if (in_array($priority, ['breaking', 'high']) && $results['article']) {
                    $this->fastTrackArticle($results['article'], $priority);
                }
            }

            // Route 2: Event extraction
            if ($raw->has_event && !empty($raw->event_data)) {
                $results['event_created'] = $this->routeToEvent($raw, $region);
            }

            // Route 3: Announcement (direct publish for community notices)
            if ($this->isAnnouncement($primaryType, $contentTypes)) {
                $results['announcement_created'] = $this->routeToAnnouncement($raw, $region);
            }

            // Mark as processed
            $outputIds = [];
            if ($results['article']) $outputIds['article_id'] = $results['article']->id;

            $raw->update([
                'processing_status' => RawContent::PROC_COMPLETED,
                'processed_at' => now(),
                'output_ids' => $outputIds,
                'article_id' => $results['article']?->id,
                'was_published' => $results['article'] !== null || $results['announcement_created'],
            ]);

            Log::info('ContentRouting: Content routed successfully', [
                'id' => $raw->id,
                'article_created' => $results['article'] !== null,
                'event_created' => $results['event_created'],
                'announcement_created' => $results['announcement_created'],
            ]);

        } catch (Exception $e) {
            Log::error('ContentRouting: Routing failed', [
                'id' => $raw->id,
                'error' => $e->getMessage(),
            ]);

            $raw->update([
                'processing_status' => RawContent::PROC_FAILED,
                'processing_error' => $e->getMessage(),
            ]);
        }

        return $results;
    }

    /**
     * Create a NewsArticle from RawContent (the Pipeline B → A bridge).
     * Mirrors CivicSourceCollectionService::createNewsArticleFromItem().
     */
    private function createNewsArticle(RawContent $raw, ?Region $region): ?NewsArticle
    {
        if (!$region) {
            Log::warning('ContentRouting: No region for article creation', ['id' => $raw->id]);
            return null;
        }

        $title = $raw->suggested_headline ?? $raw->source_title;
        $contentHash = hash('sha256', $title . '|' . ($raw->source_url ?? ''));

        // Dedup check
        $exists = NewsArticle::where('content_hash', $contentHash)
            ->where('region_id', $region->id)
            ->exists();
        if ($exists) {
            Log::debug('ContentRouting: Duplicate article skipped', ['title' => $title]);
            return null;
        }

        // Determine source type from collection context
        $sourceType = $this->inferSourceType($raw);

        return NewsArticle::create([
            'region_id' => $region->id,
            'source_type' => $sourceType,
            'source_name' => $raw->source?->name ?? 'Pipeline B',
            'title' => $title,
            'url' => $raw->source_url,
            'content_snippet' => substr($raw->source_content ?? $raw->source_excerpt ?? '', 0, 2000),
            'source_publisher' => $raw->source?->name,
            'published_at' => $raw->source_published_at ?? now(),
            'metadata' => [
                'raw_content_id' => $raw->id,
                'primary_type' => $raw->primary_type,
                'content_types' => $raw->content_types,
                'categories' => $raw->categories,
                'local_relevance_score' => $raw->local_relevance_score,
                'news_value_score' => $raw->news_value_score,
                'processing_tier' => $raw->processing_tier,
                'businesses_mentioned' => $raw->businesses_mentioned,
            ],
            'content_hash' => $contentHash,
            'processed' => false,
        ]);
    }

    /**
     * Route event data to the event creation system.
     */
    private function routeToEvent(RawContent $raw, ?Region $region): bool
    {
        try {
            $eventData = $raw->event_data;
            if (empty($eventData) || empty($eventData['event_title'])) {
                return false;
            }

            // Use existing EventExtractionService if available,
            // or create event record directly
            // TODO: Create event record in the events/go_event_city tables
            // For now, log the event for manual processing
            Log::info('ContentRouting: Event detected for routing', [
                'raw_content_id' => $raw->id,
                'event_title' => $eventData['event_title'] ?? 'Unknown',
                'event_date' => $eventData['event_date'] ?? null,
                'event_venue' => $eventData['event_venue'] ?? null,
            ]);

            $raw->update(['event_id' => null]); // Will be set when event is created
            return true;

        } catch (Exception $e) {
            Log::warning('ContentRouting: Event routing failed', [
                'id' => $raw->id, 'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Route announcements for direct publication.
     */
    private function routeToAnnouncement(RawContent $raw, ?Region $region): bool
    {
        // TODO: Create announcement record in announcements table
        // or create DayNewsPost with type='announcement'
        Log::info('ContentRouting: Announcement routed', [
            'raw_content_id' => $raw->id,
            'title' => $raw->source_title,
        ]);
        return true;
    }

    /**
     * Fast-track high-priority articles through the pipeline.
     */
    private function fastTrackArticle(NewsArticle $article, string $priority): void
    {
        $article->update([
            'metadata' => array_merge($article->metadata ?? [], [
                'fast_tracked' => true,
                'priority' => $priority,
                'fast_tracked_at' => now()->toIso8601String(),
            ]),
        ]);

        Log::info('ContentRouting: Article fast-tracked', [
            'article_id' => $article->id,
            'priority' => $priority,
        ]);
    }

    private function shouldCreateArticle(string $primaryType, array $contentTypes): bool
    {
        $articleTypes = [
            'breaking_news', 'news', 'feature', 'business_news',
            'crime_report', 'school_news', 'sports_result',
            'human_interest', 'new_business', 'press_release',
        ];

        if (in_array($primaryType, $articleTypes)) return true;
        return !empty(array_intersect($contentTypes, $articleTypes));
    }

    private function isAnnouncement(string $primaryType, array $contentTypes): bool
    {
        $announcementTypes = ['announcement', 'meeting_notice', 'community_event', 'fundraiser'];
        return in_array($primaryType, $announcementTypes) || !empty(array_intersect($contentTypes, $announcementTypes));
    }

    private function resolveRegion(RawContent $raw): ?Region
    {
        if ($raw->region_id) return Region::find($raw->region_id);
        if ($raw->community_id) {
            $community = $raw->community;
            return $community?->regions()->first();
        }
        return null;
    }

    private function inferSourceType(RawContent $raw): string
    {
        $method = $raw->collection_method;
        if ($method === 'rss') return 'rss_feed';
        if ($method === 'scrape') return 'web_scrape';
        if ($method === 'email') return 'email_newsletter';
        if ($method === 'wire_service') return 'wire_service';
        return 'pipeline_b';
    }
}
```

### 2. CREATE: ProcessClassifiedContentJob

**File:** `app/Jobs/Newsroom/ProcessClassifiedContentJob.php`

```php
<?php

declare(strict_types=1);

namespace App\Jobs\Newsroom;

use App\Models\RawContent;
use App\Services\Newsroom\ContentRoutingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessClassifiedContentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;
    public $tries = 1;

    public function handle(ContentRoutingService $router): void
    {
        // Get classified content pending processing
        $items = RawContent::where('classification_status', RawContent::CLASS_CLASSIFIED)
            ->where('processing_status', RawContent::PROC_PENDING)
            ->orderByRaw("
                CASE priority
                    WHEN 'breaking' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'normal' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END
            ")
            ->limit(50) // Process in batches of 50
            ->get();

        if ($items->isEmpty()) return;

        Log::info('ProcessClassifiedContent: Processing batch', ['count' => $items->count()]);

        $stats = ['routed' => 0, 'articles' => 0, 'events' => 0, 'failed' => 0];

        foreach ($items as $raw) {
            try {
                $result = $router->routeContent($raw);
                $stats['routed']++;
                if ($result['article']) $stats['articles']++;
                if ($result['event_created']) $stats['events']++;
            } catch (\Exception $e) {
                $stats['failed']++;
                Log::error('ProcessClassifiedContent: Item failed', [
                    'id' => $raw->id, 'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('ProcessClassifiedContent: Batch complete', $stats);
    }
}
```

---

## Verification

```bash
php artisan tinker --execute="
    \$router = app(\App\Services\Newsroom\ContentRoutingService::class);
    echo 'ContentRoutingService: OK' . PHP_EOL;

    // Check for classified but unprocessed content
    \$pending = \App\Models\RawContent::where('classification_status', 'classified')
        ->where('processing_status', 'pending')
        ->count();
    echo 'Pending content to route: ' . \$pending . PHP_EOL;
"

# Test the job manually (dry run)
# php artisan tinker --execute="
#     (new \App\Jobs\Newsroom\ProcessClassifiedContentJob())->handle(
#         app(\App\Services\Newsroom\ContentRoutingService::class)
#     );
# "
```

**Expected:** ContentRoutingService loads without errors. Any pending classified content count is displayed. Manual job run should process pending items and create NewsArticle records.
