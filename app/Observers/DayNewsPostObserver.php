<?php

namespace App\Observers;

use App\Models\DayNewsPost;
use App\Services\Cies\OpportunityAnalyzerService;

class DayNewsPostObserver
{
    public function __construct(
        private readonly OpportunityAnalyzerService $analyzer
    ) {
    }

    /**
     * Handle the DayNewsPost "created" event.
     */
    public function created(DayNewsPost $dayNewsPost): void
    {
        // Analyze for sales opportunities immediately upon creation
        // In high-volume production, this should be dispatched to a Queue:
        // AnalyzeSalesOpportunityJob::dispatch($dayNewsPost);
        $this->analyzer->analyze($dayNewsPost);
    }

    /**
     * Handle the DayNewsPost "updated" event.
     */
    public function updated(DayNewsPost $dayNewsPost): void
    {
        //
    }

    /**
     * Handle the DayNewsPost "deleted" event.
     */
    public function deleted(DayNewsPost $dayNewsPost): void
    {
        //
    }

    /**
     * Handle the DayNewsPost "restored" event.
     */
    public function restored(DayNewsPost $dayNewsPost): void
    {
        //
    }

    /**
     * Handle the DayNewsPost "force deleted" event.
     */
    public function forceDeleted(DayNewsPost $dayNewsPost): void
    {
        //
    }
}
