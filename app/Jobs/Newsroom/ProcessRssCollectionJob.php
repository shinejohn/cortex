<?php

namespace App\Jobs\Newsroom;

use App\Models\CollectionMethod;
use App\Services\Newsroom\RssCollectionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessRssCollectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public string $methodId) {}

    public function handle(RssCollectionService $service): void
    {
        $method = CollectionMethod::find($this->methodId);
        if (!$method || !$method->is_enabled) return;
        $service->collect($method);
    }
}
