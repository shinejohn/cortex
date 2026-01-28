<?php

declare(strict_types=1);

namespace App\Jobs\Story;

use App\Models\Region;
use App\Services\Story\StoryFollowUpService;
use App\Services\Story\EngagementScoringService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Process Story Follow-Ups Job
 * 
 * Runs periodically to:
 * 1. Process pending follow-up triggers
 * 2. Identify high-engagement articles needing threads
 * 3. Update thread statuses
 * 4. Generate follow-up queue for editors
 */
class ProcessStoryFollowUpsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600; // 10 minutes

    public $tries = 2;

    public $backoff = [60, 300]; // 1 min, 5 min

    public function __construct(
        public Region $region,
        public array $options = []
    ) {}

    public function handle(
        StoryFollowUpService $followUpService,
        EngagementScoringService $engagementService
    ): void {
        Log::info('StoryFollowUps: Starting processing', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'options' => $this->options,
        ]);

        $results = [
            'region' => $this->region->name,
            'started_at' => now()->toIso8601String(),
            'steps' => [],
        ];

        try {
            // Step 1: Process pending triggers
            if ($this->shouldRunStep('triggers')) {
                $triggerResults = $followUpService->processTriggers($this->region);
                $results['steps']['triggers'] = $triggerResults;

                Log::info('StoryFollowUps: Processed triggers', [
                    'region_id' => $this->region->id,
                    'processed' => $triggerResults['processed'],
                    'triggered' => $triggerResults['triggered'],
                ]);
            }

            // Step 2: Process high-engagement articles
            if ($this->shouldRunStep('high_engagement')) {
                $engagementResults = $followUpService->processHighEngagementArticles($this->region);
                $results['steps']['high_engagement'] = $engagementResults;

                Log::info('StoryFollowUps: Processed high engagement articles', [
                    'region_id' => $this->region->id,
                    'analyzed' => $engagementResults['articles_analyzed'],
                    'threads_created' => $engagementResults['threads_created'],
                ]);
            }

            // Step 3: Update thread statuses
            if ($this->shouldRunStep('statuses')) {
                $statusResults = $followUpService->updateThreadStatuses($this->region);
                $results['steps']['statuses'] = $statusResults;

                Log::info('StoryFollowUps: Updated thread statuses', [
                    'region_id' => $this->region->id,
                    'checked' => $statusResults['checked'],
                    'resolved' => $statusResults['resolved'],
                ]);
            }

            // Step 4: Generate follow-up queue
            if ($this->shouldRunStep('queue')) {
                $queue = $followUpService->generateFollowUpQueue($this->region, 20);
                $results['steps']['queue'] = [
                    'items_generated' => $queue->count(),
                ];

                Log::info('StoryFollowUps: Generated follow-up queue', [
                    'region_id' => $this->region->id,
                    'queue_size' => $queue->count(),
                ]);
            }

            // Step 5: Recalculate engagement thresholds (weekly)
            if ($this->shouldRunStep('thresholds') || $this->isWeeklyRun()) {
                $engagementService->recalculateThresholds($this->region);
                $results['steps']['thresholds'] = ['recalculated' => true];
            }

            $results['completed_at'] = now()->toIso8601String();
            $results['status'] = 'success';

            Log::info('StoryFollowUps: Processing completed', $results);

        } catch (Exception $e) {
            $results['status'] = 'failed';
            $results['error'] = $e->getMessage();

            Log::error('StoryFollowUps: Processing failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('StoryFollowUps: Job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Check if a specific step should run
     */
    private function shouldRunStep(string $step): bool
    {
        // If specific steps are requested, only run those
        if (!empty($this->options['only_steps'])) {
            return in_array($step, $this->options['only_steps']);
        }

        // If steps are excluded, skip them
        if (!empty($this->options['skip_steps'])) {
            return !in_array($step, $this->options['skip_steps']);
        }

        return true;
    }

    /**
     * Check if this is a weekly run (for expensive operations)
     */
    private function isWeeklyRun(): bool
    {
        return now()->dayOfWeek === 0; // Sunday
    }
}
