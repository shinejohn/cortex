<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\CivicSource;
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
 * Process Single Civic Source Job
 * 
 * Collects content from a single civic source.
 * Useful for parallel processing of multiple sources.
 */
class ProcessSingleCivicSourceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 120; // 2 minutes

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 30;

    /**
     * Indicate if the job should be marked as failed on timeout.
     */
    public bool $failOnTimeout = true;

    public function __construct(
        public CivicSource $source
    ) {}

    /**
     * Execute the job.
     */
    public function handle(CivicSourceCollectionService $service): void
    {
        Log::info('ProcessSingleCivicSourceJob: Starting', [
            'source_id' => $this->source->id,
            'source_name' => $this->source->name,
            'platform' => $this->source->platform->name ?? 'unknown',
        ]);

        try {
            $results = $service->collectFromSource($this->source);

            Log::info('ProcessSingleCivicSourceJob: Completed', [
                'source_id' => $this->source->id,
                'items_collected' => $results['items_collected'],
                'items_new' => $results['items_new'],
            ]);

        } catch (Exception $e) {
            Log::error('ProcessSingleCivicSourceJob: Failed', [
                'source_id' => $this->source->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('ProcessSingleCivicSourceJob: Permanently failed', [
            'source_id' => $this->source->id,
            'source_name' => $this->source->name,
            'error' => $exception->getMessage(),
        ]);

        // The source's markCollectionFailed is called in the service
    }

    /**
     * Determine if the job should be retried.
     */
    public function shouldRetry(Throwable $exception): bool
    {
        // Don't retry for certain errors
        $message = $exception->getMessage();

        // Platform not found or misconfigured
        if (str_contains($message, 'Unknown platform') || 
            str_contains($message, 'not configured')) {
            return false;
        }

        return true;
    }

    /**
     * Get the tags that should be assigned to the job.
     */
    public function tags(): array
    {
        return [
            'civic-source',
            'source:' . $this->source->id,
            'platform:' . ($this->source->platform->name ?? 'unknown'),
        ];
    }
}
