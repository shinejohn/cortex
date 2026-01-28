<?php

namespace App\Jobs\Newsroom;

use App\Models\RawContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DispatchProcessingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Breaking news first
        RawContent::pendingProcessing()
            ->breaking()
            ->each(fn($r) => ProcessContentByTierJob::dispatch($r->id)->onQueue('breaking'));

        // Then by tier
        RawContent::pendingProcessing()
            ->where('priority', '!=', RawContent::PRIORITY_BREAKING)
            ->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END")
            ->limit(50)
            ->each(fn($r) => ProcessContentByTierJob::dispatch($r->id)->onQueue('processing-' . $r->processing_tier));
    }
}
