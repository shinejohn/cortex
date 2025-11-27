<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use App\Services\News\EventExtractionService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class ProcessEventExtractionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 600; // 10 minutes

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 60;

    public function __construct(
        public Region $region
    ) {}

    /**
     * Execute the job.
     */
    public function handle(EventExtractionService $extractionService): void
    {
        Log::info('ProcessEventExtractionJob: Starting', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $stats = $extractionService->extractEventsForRegion($this->region);

            Log::info('ProcessEventExtractionJob: Completed', [
                'region_id' => $this->region->id,
                'region_name' => $this->region->name,
                'stats' => $stats,
            ]);
        } catch (Exception $e) {
            Log::error('ProcessEventExtractionJob: Failed', [
                'region_id' => $this->region->id,
                'region_name' => $this->region->name,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(?Exception $exception): void
    {
        Log::error('ProcessEventExtractionJob: Job failed permanently', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception?->getMessage(),
        ]);
    }
}
