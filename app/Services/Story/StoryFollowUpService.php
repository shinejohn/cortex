<?php

declare(strict_types=1);

namespace App\Services\Story;

use App\Models\NewsArticle;
use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\StoryThread;
use App\Models\StoryFollowUpTrigger;
use App\Models\StoryBeat;
use App\Services\News\NewsCollectionService;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Story Follow-Up Service
 * 
 * Orchestrates the follow-up process:
 * - Processes pending triggers
 * - Identifies stories needing follow-up
 * - Coordinates with news collection for updates
 * - Manages story thread lifecycle
 */
class StoryFollowUpService
{
    public function __construct(
        private readonly StoryAnalysisService $analysisService,
        private readonly EngagementScoringService $engagementService,
        private readonly NewsCollectionService $newsCollectionService
    ) {
    }

    /**
     * Process all pending follow-up triggers for a region
     */
    public function processTriggers(Region $region): array
    {
        $results = [
            'processed' => 0,
            'triggered' => 0,
            'expired' => 0,
            'follow_ups_created' => 0,
            'errors' => [],
        ];

        $triggers = StoryFollowUpTrigger::dueForCheck()
            ->whereHas('storyThread', function ($q) use ($region) {
                $q->where('region_id', $region->id);
            })
            ->with('storyThread')
            ->get();

        Log::info('StoryFollowUp: Processing triggers', [
            'region_id' => $region->id,
            'trigger_count' => $triggers->count(),
        ]);

        foreach ($triggers as $trigger) {
            try {
                $result = $this->processTrigger($trigger);
                $results['processed']++;

                if ($result['triggered']) {
                    $results['triggered']++;
                }
                if ($result['expired']) {
                    $results['expired']++;
                }
                if ($result['follow_up_created']) {
                    $results['follow_ups_created']++;
                }

            } catch (Exception $e) {
                $results['errors'][] = [
                    'trigger_id' => $trigger->id,
                    'error' => $e->getMessage(),
                ];
                Log::error('StoryFollowUp: Trigger processing failed', [
                    'trigger_id' => $trigger->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $results;
    }

    /**
     * Process a single trigger
     */
    public function processTrigger(StoryFollowUpTrigger $trigger): array
    {
        $result = [
            'triggered' => false,
            'expired' => false,
            'follow_up_created' => false,
            'reason' => null,
        ];

        // Check if trigger should still be active
        if (!$trigger->shouldTrigger()) {
            if ($trigger->expires_at && $trigger->expires_at->lt(now())) {
                $trigger->markExpired();
                $result['expired'] = true;
            }
            return $result;
        }

        $thread = $trigger->storyThread;

        // Process based on trigger type
        $shouldFire = match ($trigger->trigger_type) {
            StoryFollowUpTrigger::TYPE_TIME_BASED => $this->checkTimeTrigger($trigger, $thread),
            StoryFollowUpTrigger::TYPE_ENGAGEMENT => $this->checkEngagementTrigger($trigger, $thread),
            StoryFollowUpTrigger::TYPE_DATE_EVENT => $this->checkDateEventTrigger($trigger, $thread),
            StoryFollowUpTrigger::TYPE_RESOLUTION => $this->checkResolutionTrigger($trigger, $thread),
            StoryFollowUpTrigger::TYPE_SCHEDULED => $this->checkScheduledSearchTrigger($trigger, $thread),
            default => ['fire' => false, 'reason' => 'Unknown trigger type'],
        };

        if ($shouldFire['fire']) {
            $trigger->markTriggered($shouldFire['reason'], $shouldFire['data'] ?? null);
            $result['triggered'] = true;
            $result['reason'] = $shouldFire['reason'];

            // Create follow-up request
            if ($followUp = $this->createFollowUpRequest($thread, $trigger, $shouldFire)) {
                $result['follow_up_created'] = true;
            }
        } else {
            // Reschedule check
            $trigger->recordCheck($this->calculateNextCheck($trigger));
        }

        return $result;
    }

    /**
     * Identify threads needing follow-up (proactive check)
     */
    public function identifyThreadsNeedingFollowUp(Region $region): Collection
    {
        $threads = StoryThread::forRegion($region)
            ->active()
            ->with(['articles', 'triggers'])
            ->get();

        $needsFollowUp = collect();

        foreach ($threads as $thread) {
            $analysis = $this->analysisService->analyzeThreadForFollowUp($thread);

            if ($analysis['needs_followup'] ?? false) {
                $thread->follow_up_analysis = $analysis;
                $thread->follow_up_priority = $this->engagementService->calculateFollowUpPriority($thread);
                $needsFollowUp->push($thread);
            }
        }

        return $needsFollowUp->sortByDesc('follow_up_priority');
    }

    /**
     * Process a single new article for story threading (Real-time check)
     * @param NewsArticle|DayNewsPost $article
     */
    public function processNewArticle($article): ?StoryThread
    {
        Log::info('StoryFollowUp: Processing new article for threads', ['article_id' => $article->id]);

        $region = $article->regions()->first();
        if (!$region) {
            return null; // Cannot process without region context
        }

        // 1. Check if it matches an existing thread
        $matchingThread = $this->analysisService->findMatchingThread($article, $region);

        if ($matchingThread) {
            $matchingThread->addArticle($article, 'development'); // Assume development for now
            Log::info('StoryFollowUp: Linked article to existing thread', [
                'article_id' => $article->id,
                'thread_id' => $matchingThread->id
            ]);
            return $matchingThread;
        }

        // 2. If no match, analyze if it should start a NEW thread
        $analysis = $this->analysisService->analyzeArticle($article);

        if ($analysis['is_ongoing_story'] ?? false) {
            $newThread = $this->analysisService->createThreadFromArticle($article);
            Log::info('StoryFollowUp: Created new thread from origin article', [
                'article_id' => $article->id,
                'thread_id' => $newThread->id
            ]);
            return $newThread;
        }

        return null; // Not part of a story thread
    }

    /**
     * Auto-create threads for high-engagement unthreaded articles
     */
    public function processHighEngagementArticles(Region $region): array
    {
        $results = [
            'articles_analyzed' => 0,
            'threads_created' => 0,
            'threads_joined' => 0,
        ];

        $articles = $this->engagementService->getHighEngagementUnthreaded($region, 3);
        $results['articles_analyzed'] = $articles->count();

        foreach ($articles as $article) {
            // Check if it belongs to an existing thread
            $existingThread = $this->analysisService->findMatchingThread($article, $region);

            if ($existingThread) {
                $existingThread->addArticle($article, 'update');
                $results['threads_joined']++;

                Log::info('StoryFollowUp: Article joined existing thread', [
                    'article_id' => $article->id,
                    'thread_id' => $existingThread->id,
                ]);
            } else {
                // Analyze if it should be a new thread
                $analysis = $this->analysisService->analyzeArticle($article);

                if ($analysis['is_ongoing_story'] ?? false) {
                    $newThread = $this->analysisService->createThreadFromArticle($article);
                    $results['threads_created']++;

                    Log::info('StoryFollowUp: Created new thread from article', [
                        'article_id' => $article->id,
                        'thread_id' => $newThread->id,
                    ]);
                }
            }
        }

        return $results;
    }

    /**
     * Update thread status based on recent activity
     */
    public function updateThreadStatuses(Region $region): array
    {
        $results = [
            'checked' => 0,
            'resolved' => 0,
            'dormant' => 0,
            'monitoring' => 0,
        ];

        $threads = StoryThread::forRegion($region)
            ->whereIn('status', [StoryThread::STATUS_DEVELOPING, StoryThread::STATUS_MONITORING])
            ->get();

        foreach ($threads as $thread) {
            $results['checked']++;

            // Check if resolved via AI analysis
            $analysis = $this->analysisService->analyzeThreadForFollowUp($thread);

            if ($analysis['is_resolved'] ?? false) {
                $thread->markResolved(
                    $analysis['resolution_type'] ?? 'natural',
                    $analysis['reason'] ?? null
                );
                $results['resolved']++;
                continue;
            }

            // Check if dormant (no activity, low likelihood of developments)
            if ($thread->isStale(14) && ($analysis['should_continue_monitoring'] ?? true) === false) {
                $thread->update(['status' => StoryThread::STATUS_DORMANT]);
                $results['dormant']++;
                continue;
            }

            // Downgrade developing to monitoring if no recent updates
            if ($thread->status === StoryThread::STATUS_DEVELOPING && $thread->isStale(7)) {
                $thread->update(['status' => StoryThread::STATUS_MONITORING]);
                $results['monitoring']++;
            }

            // Update recommended status
            if ($recommended = $analysis['recommended_status'] ?? null) {
                if ($recommended !== $thread->status) {
                    $thread->update(['status' => $recommended]);
                }
            }
        }

        return $results;
    }

    /**
     * Generate follow-up article queue for editors
     */
    public function generateFollowUpQueue(Region $region, int $limit = 10): Collection
    {
        $queue = collect();

        // Get threads needing follow-up
        $threads = $this->identifyThreadsNeedingFollowUp($region);

        foreach ($threads->take($limit) as $thread) {
            $suggestions = $this->analysisService->suggestFollowUpArticles($thread);

            foreach ($suggestions as $suggestion) {
                $queue->push([
                    'thread_id' => $thread->id,
                    'thread_title' => $thread->title,
                    'priority' => $thread->follow_up_priority,
                    'engagement_score' => $thread->avg_engagement_score,
                    'days_since_update' => $thread->days_since_last_article,
                    'suggestion' => $suggestion,
                ]);
            }
        }

        return $queue->sortByDesc('priority')->take($limit);
    }

    // =========================================================================
    // TRIGGER CHECKERS
    // =========================================================================

    private function checkTimeTrigger(StoryFollowUpTrigger $trigger, StoryThread $thread): array
    {
        $daysAfterLast = $trigger->getCondition('days_after_last', 3);

        if (
            $thread->last_article_at &&
            $thread->last_article_at->lt(now()->subDays($daysAfterLast))
        ) {

            // Get AI analysis
            $analysis = $this->analysisService->analyzeThreadForFollowUp($thread);

            if ($analysis['needs_followup'] ?? false) {
                return [
                    'fire' => true,
                    'reason' => "No update in {$daysAfterLast} days, follow-up needed",
                    'data' => ['analysis' => $analysis],
                ];
            }
        }

        return ['fire' => false, 'reason' => 'Not yet time for follow-up'];
    }

    private function checkEngagementTrigger(StoryFollowUpTrigger $trigger, StoryThread $thread): array
    {
        $minViews = $trigger->getCondition('min_views', 1000);
        $minComments = $trigger->getCondition('min_comments', 50);

        $meetsViews = $thread->total_views >= $minViews;
        $meetsComments = $thread->total_comments >= $minComments;

        if ($meetsViews || $meetsComments) {
            return [
                'fire' => true,
                'reason' => "High engagement: {$thread->total_views} views, {$thread->total_comments} comments",
                'data' => [
                    'views' => $thread->total_views,
                    'comments' => $thread->total_comments,
                ],
            ];
        }

        return ['fire' => false, 'reason' => 'Engagement thresholds not met'];
    }

    private function checkDateEventTrigger(StoryFollowUpTrigger $trigger, StoryThread $thread): array
    {
        $eventDate = $trigger->getCondition('date');
        $daysBefore = $trigger->getCondition('days_before', 1);
        $event = $trigger->getCondition('event', 'Scheduled event');

        if (!$eventDate) {
            return ['fire' => false, 'reason' => 'No event date specified'];
        }

        $targetDate = \Carbon\Carbon::parse($eventDate);
        $checkDate = $targetDate->subDays($daysBefore);

        if (now()->gte($checkDate)) {
            return [
                'fire' => true,
                'reason' => "Upcoming event: {$event} on {$eventDate}",
                'data' => [
                    'event' => $event,
                    'event_date' => $eventDate,
                ],
            ];
        }

        return ['fire' => false, 'reason' => 'Event not yet upcoming'];
    }

    private function checkResolutionTrigger(StoryFollowUpTrigger $trigger, StoryThread $thread): array
    {
        $keywords = $trigger->getCondition('check_keywords', []);

        if (empty($keywords)) {
            return ['fire' => false, 'reason' => 'No keywords to check'];
        }

        // Search for recent news about this thread
        $searchResults = $this->searchForUpdates($thread, $keywords);

        if (!empty($searchResults)) {
            return [
                'fire' => true,
                'reason' => 'Found potential updates matching keywords: ' . implode(', ', $keywords),
                'data' => ['search_results' => $searchResults],
            ];
        }

        return ['fire' => false, 'reason' => 'No updates found'];
    }

    private function checkScheduledSearchTrigger(StoryFollowUpTrigger $trigger, StoryThread $thread): array
    {
        $keywords = $thread->monitoring_keywords ?? [];

        if (empty($keywords)) {
            return ['fire' => false, 'reason' => 'No monitoring keywords'];
        }

        $searchResults = $this->searchForUpdates($thread, $keywords);

        if (!empty($searchResults)) {
            return [
                'fire' => true,
                'reason' => 'Scheduled search found updates',
                'data' => ['search_results' => $searchResults],
            ];
        }

        return ['fire' => false, 'reason' => 'No new developments found'];
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private function searchForUpdates(StoryThread $thread, array $keywords): array
    {
        // Build search query from thread context
        $query = $this->buildSearchQuery($thread, $keywords);

        try {
            // Use news collection service to search for updates
            // This would integrate with your existing SERP API or other sources
            $results = $this->newsCollectionService->searchNews($query, [
                'region' => $thread->region_id,
                'days_back' => 7,
                'exclude_existing' => true,
            ]);

            return $results->toArray();

        } catch (Exception $e) {
            Log::warning('StoryFollowUp: Search failed', [
                'thread_id' => $thread->id,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    private function buildSearchQuery(StoryThread $thread, array $keywords): string
    {
        // Start with monitoring keywords
        $queryParts = $keywords;

        // Add key people names
        foreach ($thread->key_people ?? [] as $person) {
            if (!empty($person['name'])) {
                $queryParts[] = '"' . $person['name'] . '"';
            }
        }

        // Limit query length
        $query = implode(' OR ', array_slice($queryParts, 0, 5));

        return $query;
    }

    private function createFollowUpRequest(StoryThread $thread, StoryFollowUpTrigger $trigger, array $triggerData): ?array
    {
        // Create a follow-up request in the editorial queue
        // This would integrate with your existing editorial workflow

        $request = [
            'thread_id' => $thread->id,
            'trigger_id' => $trigger->id,
            'reason' => $triggerData['reason'],
            'priority' => $this->engagementService->calculateFollowUpPriority($thread),
            'suggested_angle' => $this->getSuggestedAngle($thread, $trigger, $triggerData),
            'search_data' => $triggerData['data'] ?? null,
            'created_at' => now(),
        ];

        // You would store this in an editorial queue table
        // For now, just log it
        Log::info('StoryFollowUp: Follow-up request created', $request);

        return $request;
    }

    private function getSuggestedAngle(StoryThread $thread, StoryFollowUpTrigger $trigger, array $triggerData): string
    {
        return match ($trigger->trigger_type) {
            StoryFollowUpTrigger::TYPE_TIME_BASED => "Update on {$thread->title}: What's happened since our last report",
            StoryFollowUpTrigger::TYPE_DATE_EVENT => "Preview: " . ($triggerData['data']['event'] ?? 'Upcoming event'),
            StoryFollowUpTrigger::TYPE_RESOLUTION => "Breaking: New developments in {$thread->title}",
            StoryFollowUpTrigger::TYPE_ENGAGEMENT => "Deep dive: Why readers are following {$thread->title}",
            default => "Follow-up: {$thread->title}",
        };
    }

    private function calculateNextCheck(StoryFollowUpTrigger $trigger): \DateTime
    {
        // Exponential backoff for repeated checks
        $baseInterval = match ($trigger->trigger_type) {
            StoryFollowUpTrigger::TYPE_RESOLUTION => 1,  // Check daily
            StoryFollowUpTrigger::TYPE_TIME_BASED => 2,  // Check every 2 days
            StoryFollowUpTrigger::TYPE_SCHEDULED => 3,   // Check every 3 days
            default => 2,
        };

        $multiplier = min(4, 1 + ($trigger->check_count * 0.5));
        $days = (int) ceil($baseInterval * $multiplier);

        return now()->addDays($days);
    }
}
