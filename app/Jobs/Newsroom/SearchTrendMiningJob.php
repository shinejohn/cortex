<?php

declare(strict_types=1);

namespace App\Jobs\Newsroom;

use App\Services\Newsroom\SearchTrendMiningService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class SearchTrendMiningJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;

    public int $tries = 1;

    public function handle(SearchTrendMiningService $service): void
    {
        Log::info('Job: SearchTrendMining starting');
        $stats = $service->mineAllRegions();
        Log::info('Job: SearchTrendMining complete', ['stats' => $stats]);
    }
}
