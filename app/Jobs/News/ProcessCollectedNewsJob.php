<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Orchestrator job that kicks off the news processing pipeline (Phases 3-7).
 * Each phase is handled by a separate job to avoid timeouts.
 */
final class ProcessCollectedNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 30; // Quick job - just dispatches Phase 3

    public $tries = 1;

    public function __construct(
        public Region $region
    ) {}

    public function handle(): void
    {
        Log::info('Starting news processing pipeline for region', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        // Dispatch Phase 3 which will chain to Phase 4, 5, 6, 7
        ProcessPhase3ShortlistingJob::dispatch($this->region);

        Log::info('Dispatched Phase 3 (shortlisting) job', [
            'region_id' => $this->region->id,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Failed to start news processing pipeline', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
