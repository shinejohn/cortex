<?php

declare(strict_types=1);

namespace App\Jobs\Newsroom;

use App\Services\Newsroom\TrendDetectionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class TrendDetectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 900;

    public int $tries = 1;

    public function handle(TrendDetectionService $service): void
    {
        Log::info('Job: TrendDetection starting');
        $stats = $service->refreshTrendsForAllRegions();
        Log::info('Job: TrendDetection complete', ['stats' => $stats]);
    }
}
