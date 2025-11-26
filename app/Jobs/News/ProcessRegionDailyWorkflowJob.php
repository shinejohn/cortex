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
 * Orchestrator job for the daily news workflow.
 *
 * This job kicks off the phased pipeline:
 * Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
 *
 * Each phase is handled by a separate job to avoid timeouts.
 */
final class ProcessRegionDailyWorkflowJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 30; // Quick job - just dispatches Phase 2

    public $tries = 1;

    public function __construct(
        public Region $region
    ) {}

    public function handle(): void
    {
        Log::info('Starting daily workflow pipeline for region', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        // Dispatch Phase 2 which will chain to Phase 3, 4, 5, 6, 7
        ProcessPhase2NewsCollectionJob::dispatch($this->region);

        Log::info('Dispatched Phase 2 (news collection) job', [
            'region_id' => $this->region->id,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Failed to start daily workflow pipeline', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
