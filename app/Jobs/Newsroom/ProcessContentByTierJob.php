<?php

namespace App\Jobs\Newsroom;

use App\Models\RawContent;
use App\Services\News\ArticleGenerationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessContentByTierJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $backoff = 60;

    public function __construct(public string $rawContentId)
    {
    }

    public function handle(ArticleGenerationService $generationService): void
    {
        $rawContent = RawContent::find($this->rawContentId);
        if (!$rawContent || $rawContent->processing_status !== RawContent::PROC_PENDING)
            return;

        try {
            $rawContent->update(['processing_status' => 'processing']);

            // Generate article based on tier
            $article = match ($rawContent->processing_tier) {
                RawContent::TIER_BRIEF => $generationService->generateBrief($rawContent),
                RawContent::TIER_FULL => $generationService->generateFull($rawContent),
                default => $generationService->generateStandard($rawContent),
            };

            // Create event if needed
            $eventId = null;
            if ($rawContent->has_event && $rawContent->event_data) {
                $eventId = $this->createEvent($rawContent);
            }

            $rawContent->markProcessed([
                'article_id' => $article->id,
                'event_id' => $eventId,
            ]);

            // Dispatch story analysis job
            \App\Jobs\Story\AnalyzeStoryPotentialJob::dispatch($article->id);

        } catch (\Exception $e) {
            Log::error('Content processing failed', ['id' => $rawContent->id, 'error' => $e->getMessage()]);
            $rawContent->update(['processing_status' => RawContent::PROC_FAILED, 'processing_error' => $e->getMessage()]);
        }
    }

    private function createEvent(RawContent $rawContent): ?int
    {
        // Create event from event_data
        return null; // Implement based on your Event model
    }
}
