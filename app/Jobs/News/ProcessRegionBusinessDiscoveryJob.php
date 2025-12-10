<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use App\Services\News\BusinessDiscoveryService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * @deprecated Use ProcessBusinessDiscoveryDispatcherJob instead for parallelized processing
 */
final class ProcessRegionBusinessDiscoveryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600; // 10 minutes per region

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(BusinessDiscoveryService $businessDiscovery): void
    {
        Log::info('Starting business discovery job for region', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $count = $businessDiscovery->discoverBusinesses($this->region);

            Log::info('Completed business discovery job for region', [
                'region_id' => $this->region->id,
                'businesses_discovered' => $count,
            ]);
        } catch (Exception $e) {
            Log::error('Business discovery job failed for region', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Business discovery job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
