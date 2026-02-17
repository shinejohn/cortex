<?php

declare(strict_types=1);

namespace App\Jobs\EventCity;

use App\Services\EventCity\LocationSharingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class CleanupExpiredLocationShares implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(LocationSharingService $service): void
    {
        $cleaned = $service->cleanupExpiredShares();

        Log::info('Expired location shares cleaned up', ['count' => $cleaned]);
    }
}
