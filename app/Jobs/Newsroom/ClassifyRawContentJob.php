<?php

namespace App\Jobs\Newsroom;

use App\Models\RawContent;
use App\Services\Newsroom\ContentClassificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ClassifyRawContentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public string $rawContentId) {}

    public function handle(ContentClassificationService $service): void
    {
        $rawContent = RawContent::find($this->rawContentId);
        if (!$rawContent || $rawContent->classification_status !== RawContent::CLASS_PENDING) return;
        $service->classify($rawContent);
    }
}
