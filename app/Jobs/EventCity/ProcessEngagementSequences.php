<?php

declare(strict_types=1);

namespace App\Jobs\EventCity;

use App\Services\EventCity\EngagementSequenceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class ProcessEngagementSequences implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(EngagementSequenceService $service): void
    {
        $processed = $service->processNextSteps();

        Log::info('Engagement sequences processed', ['steps_processed' => $processed]);
    }
}
