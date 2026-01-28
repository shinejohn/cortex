<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\CivicSource;
use App\Models\Region;
use App\Services\Civic\CivicSourceCollectionService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Process Civic Sources Job
 * 
 * Collects content from all civic sources for a region.
 * Can be dispatched as part of the news workflow or independently.
 */
class ProcessCivicSourcesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 300; // 5 minutes

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * Indicate if the job should be marked as failed on timeout.
     */
    public bool $failOnTimeout = true;

    public function __construct(
        public Region $region,
        public bool $processItems = true
    ) {}

    /**
     * Execute the job.
     */
    public function handle(CivicSourceCollectionService $service): void
    {
        Log::info('ProcessCivicSourcesJob: Starting', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'process_items' => $this->processItems,
        ]);

        try {
            // Collect from all civic sources
            $collectionResults = $service->collectForRegion($this->region);

            Log::info('ProcessCivicSourcesJob: Collection completed', [
                'region_id' => $this->region->id,
                'sources_processed' => $collectionResults['sources_processed'],
                'items_collected' => $collectionResults['items_collected'],
                'items_new' => $collectionResults['items_new'],
            ]);

            // Process pending items into NewsArticles
            if ($this->processItems && $collectionResults['items_new'] > 0) {
                $processingResults = $service->processPendingItems($this->region);

                Log::info('ProcessCivicSourcesJob: Processing completed', [
                    'region_id' => $this->region->id,
                    'articles_created' => $processingResults['articles_created'],
                ]);
            }

        } catch (Exception $e) {
            Log::error('ProcessCivicSourcesJob: Failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('ProcessCivicSourcesJob: Permanently failed', [
            'region_id' => $this->region->id,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Get the tags that should be assigned to the job.
     */
    public function tags(): array
    {
        return [
            'civic-sources',
            'region:' . $this->region->id,
        ];
    }
}
