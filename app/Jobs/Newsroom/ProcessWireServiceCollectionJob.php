<?php

declare(strict_types=1);

namespace App\Jobs\Newsroom;

use App\Services\Newsroom\WireServiceCollectionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessWireServiceCollectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;

    public int $tries = 1;

    public function handle(WireServiceCollectionService $service): void
    {
        Log::info('Job: WireServiceCollection starting');
        $stats = $service->collectAll();
        Log::info('Job: WireServiceCollection complete', ['stats' => $stats]);
    }

    public function failed(Throwable $e): void
    {
        Log::error('Job: WireServiceCollection failed', ['error' => $e->getMessage()]);
    }
}
