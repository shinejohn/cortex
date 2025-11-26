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

final class ProcessPhase3ShortlistingJob implements ShouldQueue
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
        Log::info('Phase 3: Starting article shortlisting', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $shortlisted = $curationService->shortlistArticles($this->region);

            Log::info('Phase 3: Completed article shortlisting', [
                'region_id' => $this->region->id,
                'shortlisted' => $shortlisted,
            ]);

            // Dispatch next phase
            ProcessPhase4FactCheckingJob::dispatch($this->region);
        } catch (Exception $e) {
            Log::error('Phase 3: Shortlisting failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 3: Shortlisting job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
