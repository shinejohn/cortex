<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use App\Services\News\FactCheckingService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessPhase4FactCheckingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(FactCheckingService $factCheckingService): void
    {
        Log::info('Phase 4: Starting fact-checking and outline generation', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $factChecked = $factCheckingService->processForRegion($this->region);

            Log::info('Phase 4: Completed fact-checking', [
                'region_id' => $this->region->id,
                'fact_checked' => $factChecked,
            ]);

            // Dispatch next phase
            ProcessPhase5SelectionJob::dispatch($this->region);
        } catch (Exception $e) {
            Log::error('Phase 4: Fact-checking failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 4: Fact-checking job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
