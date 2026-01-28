<?php

namespace App\Jobs\Newsroom;

use App\Models\CollectionMethod;
use App\Services\Newsroom\WebScrapingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessWebScrapingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 120;

    public function __construct(public string $methodId) {}

    public function handle(WebScrapingService $service): void
    {
        $method = CollectionMethod::find($this->methodId);
        if (!$method || !$method->is_enabled) return;
        $service->scrape($method);
    }
}
