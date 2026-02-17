<?php

declare(strict_types=1);

namespace App\Jobs\EventCity;

use App\Services\EventCity\ProfileComputationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class ComputeBehavioralProfiles implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private int $batchSize = 100
    ) {}

    public function handle(ProfileComputationService $service): void
    {
        $processed = $service->computeProfilesInBatch($this->batchSize);

        Log::info('Behavioral profiles computed', ['processed' => $processed]);
    }
}
