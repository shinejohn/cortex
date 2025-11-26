<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use App\Services\News\ContentCurationService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessPhase5SelectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(ContentCurationService $curationService): void
    {
        Log::info('Phase 5: Starting final selection', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $selected = $curationService->finalSelection($this->region);

            Log::info('Phase 5: Completed final selection', [
                'region_id' => $this->region->id,
                'selected' => $selected,
            ]);

            // Dispatch next phase
            ProcessPhase6GenerationJob::dispatch($this->region);
        } catch (Exception $e) {
            Log::error('Phase 5: Final selection failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 5: Final selection job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
