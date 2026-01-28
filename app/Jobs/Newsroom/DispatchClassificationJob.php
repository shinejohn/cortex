<?php

namespace App\Jobs\Newsroom;

use App\Models\RawContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DispatchClassificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        RawContent::pendingClassification()
            ->limit(100)
            ->each(fn($r) => ClassifyRawContentJob::dispatch($r->id)->onQueue('classification'));
    }
}
