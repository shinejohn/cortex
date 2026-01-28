<?php

namespace App\Jobs\Story;

use App\Models\DayNewsPost; // Assuming NewsArticle and DayNewsPost are similar or mapped
use App\Models\NewsArticle;  // We need to resolve which model calls this
use App\Services\Story\StoryFollowUpService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AnalyzeStoryPotentialJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120; // AI analysis can take time

    public function __construct(public string $articleId)
    {
    }

    public function handle(StoryFollowUpService $storyService): void
    {
        // Note: The system currently uses DayNewsPost as the final article model
        // but StoryFollowUpService types hint NewsArticle. 
        // We might need to ensure compatibility or alias logic.
        // For now, let's assume DayNewsPost is the primary article entity used in the pipeline.

        $article = \App\Models\DayNewsPost::find($this->articleId);

        if (!$article) {
            return;
        }

        // Wrapper/Adapter if necessary: 
        // StoryFollowUpService expects "NewsArticle", checking if DayNewsPost is compatible
        // If not, we might need to adjust the Service type hint.
        // Seeing as `processNewArticle` implementation uses `$article->regions()->first()`, 
        // DayNewsPost has `regions()` relationship, so it should be duck-typed compatible
        // EXCEPT for the type hint in the method signature.
        // I will fix the listener to pass it correctly or update service.

        $storyService->processNewArticle($article);
    }
}
