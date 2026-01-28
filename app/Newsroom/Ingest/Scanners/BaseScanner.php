<?php

declare(strict_types=1);

namespace App\Newsroom\Ingest\Scanners;

use App\Newsroom\Ingest\Contracts\IngestSource;
use Illuminate\Support\Facades\Log;

abstract class BaseScanner implements IngestSource
{
    /**
     * Log a scanning error with consistent formatting
     */
    protected function logError(string $message, array $context = []): void
    {
        Log::error("[Newsroom:{$this->getScannerType()}] {$message}", $context);
    }

    /**
     * Log a successful scan action
     */
    protected function logActivity(string $message, array $context = []): void
    {
        Log::info("[Newsroom:{$this->getScannerType()}] {$message}", $context);
    }
}
