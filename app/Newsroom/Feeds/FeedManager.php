<?php

declare(strict_types=1);

namespace App\Newsroom\Feeds;

use App\Newsroom\Ingest\Contracts\IngestSource;
use App\Newsroom\Ingest\Pipeline\SignalProcessor;
use Illuminate\Support\Facades\Log;

class FeedManager
{
    public function __construct(
        private readonly SignalProcessor $processor
    ) {
    }

    /**
     * Run a scan for a specific source and ingest the results
     */
    public function runScan(IngestSource $scanner, array $options = []): int
    {
        $scannerType = $scanner->getScannerType();
        Log::info("[Newsroom] Starting scan for {$scannerType}");

        try {
            if (!$scanner->validateConfiguration()) {
                Log::error("[Newsroom] Configuration invalid for {$scannerType}");
                return 0;
            }

            $signals = $scanner->scan($options);
            $processedCount = 0;

            foreach ($signals as $signal) {
                try {
                    $model = $this->processor->process($signal);
                    if ($model) {
                        $processedCount++;
                    }
                } catch (\Exception $e) {
                    Log::error("[Newsroom] Failed to process signal", [
                        'scanner' => $scannerType,
                        'title' => $signal->title,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::info("[Newsroom] Completed scan for {$scannerType}. Processed: {$processedCount}/{$signals->count()}");
            return $processedCount;

        } catch (\Exception $e) {
            Log::error("[Newsroom] Scan cycle failed for {$scannerType}", [
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }
}
