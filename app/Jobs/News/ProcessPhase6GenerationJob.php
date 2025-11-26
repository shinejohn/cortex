<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use App\Services\News\ArticleGenerationService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessPhase6GenerationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600; // 10 minutes (generation takes longer)

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(ArticleGenerationService $generationService): void
    {
        Log::info('Phase 6: Starting article generation', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $generated = $generationService->generateArticles($this->region);

            Log::info('Phase 6: Completed article generation', [
                'region_id' => $this->region->id,
                'generated' => $generated,
            ]);

            // Dispatch next phase
            ProcessPhase7PublishingJob::dispatch($this->region);
        } catch (Exception $e) {
            Log::error('Phase 6: Article generation failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 6: Article generation job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
