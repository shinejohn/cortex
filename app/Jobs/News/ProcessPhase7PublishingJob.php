<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use App\Services\News\PublishingService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessPhase7PublishingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120; // 2 minutes

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(PublishingService $publishingService): void
    {
        Log::info('Phase 7: Starting article publishing', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $published = $publishingService->publishArticles($this->region);

            Log::info('Phase 7: Completed article publishing', [
                'region_id' => $this->region->id,
                'published' => $published,
            ]);

            Log::info('News workflow completed for region', [
                'region_id' => $this->region->id,
                'region_name' => $this->region->name,
            ]);
        } catch (Exception $e) {
            Log::error('Phase 7: Publishing failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 7: Publishing job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
