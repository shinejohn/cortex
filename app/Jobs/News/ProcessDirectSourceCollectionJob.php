<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\CollectionMethod;
use App\Models\NewsArticle;
use App\Models\RawContent;
use App\Models\Region;
use App\Services\Newsroom\AdaptiveFetcherService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Direct Source Collection Job
 *
 * Collects news from direct sources (RSS feeds, web scraping, civic platforms)
 * via the AdaptiveFetcherService and bridges the results into NewsArticle records
 * so they flow into the existing Phase 3-7 pipeline.
 *
 * This runs as a PARALLEL channel alongside SERP API in Phase 2.
 * SERP API finds news ABOUT local businesses via Google.
 * Direct sources collect news FROM local publishers, government sites, etc.
 *
 * Dispatch from Phase 2:
 *   ProcessDirectSourceCollectionJob::dispatch($region);
 */
final class ProcessDirectSourceCollectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes - may be fetching many sources

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(AdaptiveFetcherService $fetcher): void
    {
        Log::info('DirectSourceCollection: Starting for region', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        $stats = [
            'sources_attempted' => 0,
            'sources_succeeded' => 0,
            'sources_failed' => 0,
            'raw_items_collected' => 0,
            'articles_created' => 0,
            'duplicates_skipped' => 0,
        ];

        // Get all collection methods due for this region
        $methods = CollectionMethod::dueForCollection()
            ->whereHas('source', function ($q) {
                $q->where('region_id', $this->region->id);
            })
            ->with('source')
            ->get();

        Log::info('DirectSourceCollection: Found methods due for collection', [
            'region_id' => $this->region->id,
            'method_count' => $methods->count(),
        ]);

        foreach ($methods as $method) {
            $stats['sources_attempted']++;

            try {
                $rawItems = $fetcher->fetch($method);
                $stats['raw_items_collected'] += count($rawItems);
                $stats['sources_succeeded']++;

                // Bridge each RawContent into a NewsArticle
                foreach ($rawItems as $rawContent) {
                    $article = $this->bridgeToNewsArticle($rawContent);
                    if ($article) {
                        $stats['articles_created']++;
                    } else {
                        $stats['duplicates_skipped']++;
                    }
                }

            } catch (Exception $e) {
                $stats['sources_failed']++;
                Log::warning('DirectSourceCollection: Source failed', [
                    'source' => $method->source->name ?? 'unknown',
                    'method_type' => $method->method_type,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('DirectSourceCollection: Completed for region', [
            'region_id' => $this->region->id,
            'stats' => $stats,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('DirectSourceCollection: Job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Bridge a RawContent record into a NewsArticle record.
     *
     * This is what connects the direct source pipeline (RawContent)
     * to the main workflow pipeline (NewsArticle → Phase 3-7).
     */
    private function bridgeToNewsArticle(RawContent $raw): ?NewsArticle
    {
        // Deduplicate against existing NewsArticles
        $contentHash = hash('sha256', ($raw->source_title ?? '').'|'.($raw->source_url ?? ''));

        $exists = NewsArticle::where('content_hash', $contentHash)
            ->where('region_id', $this->region->id)
            ->exists();

        if ($exists) {
            return null;
        }

        return NewsArticle::create([
            'region_id' => $this->region->id,
            'source_type' => 'direct_source',
            'source_name' => $raw->source?->name ?? 'Direct Source',
            'title' => $raw->source_title,
            'url' => $raw->source_url,
            'content_snippet' => $raw->source_excerpt ?: mb_substr($raw->source_content ?? '', 0, 500),
            'source_publisher' => $raw->source?->name ?? 'Unknown',
            'published_at' => $raw->source_published_at ?? $raw->created_at,
            'metadata' => [
                'raw_content_id' => $raw->id,
                'collection_method' => $raw->collection_method,
                'platform' => $raw->source?->detected_platform_slug,
                'source_id' => $raw->source_id,
            ],
            'content_hash' => $contentHash,
            'processed' => false,
        ]);
    }
}
