# TASK-06-P5: Create StateRolloutOrchestratorService + ProcessCommunityRolloutJob

## Context

With the foundation tables (TASK-02), expanded categories (TASK-03), Text Search (TASK-04), and Essentials field mask (TASK-05) in place, the orchestrator service ties everything together. It accepts a state code, finds all communities in that state, creates tracking records, and dispatches community rollout jobs in batches.

**Depends on:** TASK-01 (community_id on Business), TASK-02 (rollout tables), TASK-05 (field mask).

---

## Objective

Create `StateRolloutOrchestratorService` that manages state-level rollouts and `ProcessCommunityRolloutJob` that processes a single community through all 6 phases.

---

## Files to Create

### 1. CREATE: StateRolloutOrchestratorService

**File:** `app/Services/Rollout/StateRolloutOrchestratorService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services\Rollout;

use App\Models\Community;
use App\Models\Rollout\CommunityRollout;
use App\Models\Rollout\StateRollout;
use App\Jobs\Rollout\ProcessCommunityRolloutJob;
use Exception;
use Illuminate\Support\Facades\Log;

class StateRolloutOrchestratorService
{
    /**
     * Initiate a complete state rollout.
     *
     * @param string $stateCode Two-letter state code (e.g., 'TX')
     * @param array $settings {batch_size: int, throttle_ms: int, skip_enrichment: bool, priority_communities: array}
     */
    public function initiateStateRollout(string $stateCode, array $settings = []): StateRollout
    {
        $stateCode = strtoupper($stateCode);

        // Check for existing active rollout
        $existing = StateRollout::where('state_code', $stateCode)
            ->whereIn('status', [StateRollout::STATUS_IN_PROGRESS, StateRollout::STATUS_PLANNED])
            ->first();

        if ($existing) {
            throw new Exception("State {$stateCode} already has an active rollout: {$existing->id}");
        }

        // Get all communities in this state
        $communities = Community::where('state', $stateCode)
            ->orWhere('state_code', $stateCode)
            ->get();

        if ($communities->isEmpty()) {
            throw new Exception("No communities found for state: {$stateCode}");
        }

        $stateName = $this->getStateName($stateCode);

        $defaults = [
            'batch_size' => 5,
            'throttle_ms' => 100,
            'skip_enrichment' => false,
            'priority_communities' => [],
        ];
        $settings = array_merge($defaults, $settings);

        // Create state rollout record
        $stateRollout = StateRollout::create([
            'state_code' => $stateCode,
            'state_name' => $stateName,
            'status' => StateRollout::STATUS_IN_PROGRESS,
            'total_communities' => $communities->count(),
            'started_at' => now(),
            'settings' => $settings,
            'initiated_by' => auth()->id() ?? 'system',
        ]);

        Log::info('State rollout initiated', [
            'state' => $stateCode,
            'communities' => $communities->count(),
            'batch_size' => $settings['batch_size'],
        ]);

        // Create community rollout records
        foreach ($communities as $community) {
            CommunityRollout::create([
                'state_rollout_id' => $stateRollout->id,
                'community_id' => $community->id,
                'status' => CommunityRollout::STATUS_QUEUED,
            ]);
        }

        // Dispatch first batch
        $this->dispatchNextBatch($stateRollout);

        return $stateRollout;
    }

    /**
     * Dispatch the next batch of community rollouts.
     */
    public function dispatchNextBatch(StateRollout $stateRollout): int
    {
        $batchSize = $stateRollout->settings['batch_size'] ?? 5;
        $priorityCommunities = $stateRollout->settings['priority_communities'] ?? [];

        // Get queued communities, prioritizing specified ones
        $query = $stateRollout->communityRollouts()
            ->where('status', CommunityRollout::STATUS_QUEUED);

        if (!empty($priorityCommunities)) {
            $query->orderByRaw(
                "CASE WHEN community_id = ANY(?) THEN 0 ELSE 1 END",
                ['{' . implode(',', $priorityCommunities) . '}']
            );
        }

        $batch = $query->limit($batchSize)->get();

        foreach ($batch as $communityRollout) {
            ProcessCommunityRolloutJob::dispatch($communityRollout)
                ->onQueue('rollout');
        }

        Log::info('Dispatched rollout batch', [
            'state' => $stateRollout->state_code,
            'batch_size' => $batch->count(),
            'remaining' => $stateRollout->communityRollouts()
                ->where('status', CommunityRollout::STATUS_QUEUED)
                ->count() - $batch->count(),
        ]);

        return $batch->count();
    }

    /**
     * Pause a state rollout. Running communities finish, queued ones stay queued.
     */
    public function pauseStateRollout(string $rolloutId): StateRollout
    {
        $rollout = StateRollout::findOrFail($rolloutId);
        $rollout->update(['status' => StateRollout::STATUS_PAUSED]);

        // Pause queued community rollouts
        $rollout->communityRollouts()
            ->where('status', CommunityRollout::STATUS_QUEUED)
            ->update(['status' => CommunityRollout::STATUS_PAUSED]);

        Log::info('State rollout paused', ['state' => $rollout->state_code]);
        return $rollout->fresh();
    }

    /**
     * Resume a paused state rollout.
     */
    public function resumeStateRollout(string $rolloutId): StateRollout
    {
        $rollout = StateRollout::findOrFail($rolloutId);

        // Un-pause community rollouts
        $rollout->communityRollouts()
            ->where('status', CommunityRollout::STATUS_PAUSED)
            ->update(['status' => CommunityRollout::STATUS_QUEUED]);

        $rollout->update(['status' => StateRollout::STATUS_IN_PROGRESS]);

        $this->dispatchNextBatch($rollout);

        Log::info('State rollout resumed', ['state' => $rollout->state_code]);
        return $rollout->fresh();
    }

    /**
     * Get progress dashboard for a state.
     */
    public function getStateProgress(string $rolloutId): array
    {
        $rollout = StateRollout::with('communityRollouts')->findOrFail($rolloutId);

        $statuses = $rollout->communityRollouts->groupBy('status')->map->count();

        return [
            'rollout' => $rollout,
            'progress_percentage' => $rollout->progress_percentage,
            'status_breakdown' => $statuses->toArray(),
            'total_businesses' => $rollout->total_businesses_discovered,
            'total_news_sources' => $rollout->total_news_sources_created,
            'total_cost' => $rollout->total_api_cost,
            'estimated_remaining_cost' => $this->estimateRemainingCost($rollout),
        ];
    }

    private function estimateRemainingCost(StateRollout $rollout): float
    {
        $remaining = $rollout->total_communities - $rollout->completed_communities - $rollout->failed_communities;
        $avgCostPerCommunity = $rollout->completed_communities > 0
            ? $rollout->total_api_cost / $rollout->completed_communities
            : 34.00; // Estimated default from cost projections
        return round($remaining * $avgCostPerCommunity, 2);
    }

    private function getStateName(string $code): string
    {
        $states = [
            'AL' => 'Alabama', 'AK' => 'Alaska', 'AZ' => 'Arizona', 'AR' => 'Arkansas',
            'CA' => 'California', 'CO' => 'Colorado', 'CT' => 'Connecticut', 'DE' => 'Delaware',
            'FL' => 'Florida', 'GA' => 'Georgia', 'HI' => 'Hawaii', 'ID' => 'Idaho',
            'IL' => 'Illinois', 'IN' => 'Indiana', 'IA' => 'Iowa', 'KS' => 'Kansas',
            'KY' => 'Kentucky', 'LA' => 'Louisiana', 'ME' => 'Maine', 'MD' => 'Maryland',
            'MA' => 'Massachusetts', 'MI' => 'Michigan', 'MN' => 'Minnesota', 'MS' => 'Mississippi',
            'MO' => 'Missouri', 'MT' => 'Montana', 'NE' => 'Nebraska', 'NV' => 'Nevada',
            'NH' => 'New Hampshire', 'NJ' => 'New Jersey', 'NM' => 'New Mexico', 'NY' => 'New York',
            'NC' => 'North Carolina', 'ND' => 'North Dakota', 'OH' => 'Ohio', 'OK' => 'Oklahoma',
            'OR' => 'Oregon', 'PA' => 'Pennsylvania', 'RI' => 'Rhode Island', 'SC' => 'South Carolina',
            'SD' => 'South Dakota', 'TN' => 'Tennessee', 'TX' => 'Texas', 'UT' => 'Utah',
            'VT' => 'Vermont', 'VA' => 'Virginia', 'WA' => 'Washington', 'WV' => 'West Virginia',
            'WI' => 'Wisconsin', 'WY' => 'Wyoming', 'DC' => 'District of Columbia',
        ];
        return $states[$code] ?? $code;
    }
}
```

### 2. CREATE: ProcessCommunityRolloutJob

**File:** `app/Jobs/Rollout/ProcessCommunityRolloutJob.php`

```php
<?php

declare(strict_types=1);

namespace App\Jobs\Rollout;

use App\Models\Rollout\CommunityRollout;
use App\Models\Rollout\StateRollout;
use App\Services\News\BusinessDiscoveryService;
use App\Services\News\GooglePlacesService;
use App\Services\Rollout\StateRolloutOrchestratorService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessCommunityRolloutJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 1800; // 30 minutes per community
    public $tries = 3;
    public $backoff = [60, 300, 900]; // 1min, 5min, 15min

    public function __construct(
        public CommunityRollout $communityRollout
    ) {}

    public function handle(
        BusinessDiscoveryService $businessDiscovery,
        GooglePlacesService $googlePlaces,
    ): void {
        $cr = $this->communityRollout;
        $community = $cr->community;
        $region = $community->regions()->first(); // Primary region

        if (!$region) {
            $cr->failPhase(1, 'Community has no associated region');
            $cr->markFailed();
            return;
        }

        $settings = $cr->stateRollout->settings ?? [];
        $throttleMs = $settings['throttle_ms'] ?? 100;

        Log::info('Starting community rollout', [
            'community' => $community->name,
            'state' => $cr->stateRollout->state_code,
        ]);

        try {
            // ===== PHASE 1: Business Discovery =====
            $cr->startPhase(1);

            $denseCategories = config('news-workflow.business_discovery.dense_categories', []);
            $sparseCategories = config('news-workflow.business_discovery.sparse_categories', []);
            $textQueries = config('news-workflow.business_discovery.text_search_queries', []);
            $discoveredCount = 0;
            $withWebsites = 0;

            // Process dense categories (Text Search with pagination)
            foreach ($denseCategories as $category) {
                try {
                    $businesses = $googlePlaces->searchTextPlaces($region, $category);
                    foreach ($businesses as $data) {
                        $business = $businessDiscovery->upsertBusiness($data, $region);
                        $businessDiscovery->assignToRegion($business, $region);
                        $discoveredCount++;
                        if (!empty($data['website'])) $withWebsites++;
                    }

                    // Log API usage (Text Search = Essentials $5/1K, up to 3 pages)
                    $pages = max(1, ceil(count($businesses) / 20));
                    $cr->logApiUsage('google_places', 'text_search', 'essentials', $pages, $pages * 0.005, count($businesses));

                    usleep($throttleMs * 1000);
                } catch (Exception $e) {
                    Log::warning("Discovery failed for dense category", [
                        'category' => $category, 'error' => $e->getMessage(),
                    ]);
                }
            }

            // Process sparse categories (Nearby Search)
            foreach ($sparseCategories as $category) {
                try {
                    $businesses = $googlePlaces->discoverBusinessesForCategory($region, $category);
                    foreach ($businesses as $data) {
                        $business = $businessDiscovery->upsertBusiness($data, $region);
                        $businessDiscovery->assignToRegion($business, $region);
                        $discoveredCount++;
                        if (!empty($data['website'])) $withWebsites++;
                    }

                    $cr->logApiUsage('google_places', 'nearby_search', 'essentials', 1, 0.005, count($businesses));
                    usleep($throttleMs * 1000);
                } catch (Exception $e) {
                    Log::warning("Discovery failed for sparse category", [
                        'category' => $category, 'error' => $e->getMessage(),
                    ]);
                }
            }

            // Process text-search catch-all queries
            foreach ($textQueries as $query) {
                try {
                    $businesses = $googlePlaces->searchTextQuery($region, $query);
                    foreach ($businesses as $data) {
                        $business = $businessDiscovery->upsertBusiness($data, $region);
                        $businessDiscovery->assignToRegion($business, $region);
                        $discoveredCount++;
                        if (!empty($data['website'])) $withWebsites++;
                    }
                    $cr->logApiUsage('google_places', 'text_search', 'essentials', 1, 0.005, count($businesses));
                    usleep($throttleMs * 1000);
                } catch (Exception $e) {
                    Log::warning("Discovery failed for text query", [
                        'query' => $query, 'error' => $e->getMessage(),
                    ]);
                }
            }

            $cr->update([
                'businesses_discovered' => $discoveredCount,
                'businesses_with_websites' => $withWebsites,
            ]);
            $cr->completePhase(1);

            // ===== PHASE 2: Website Scanning =====
            // Implemented in TASK-07 (WebsiteScannerService)
            $cr->startPhase(2);
            // TODO: Dispatch website scan jobs for businesses with websites
            $cr->completePhase(2);

            // ===== PHASE 3: News Source Setup =====
            // Implemented in TASK-08 (evaluateAndSetupNewsSource)
            $cr->startPhase(3);
            // TODO: Create NewsSource + CollectionMethod records
            $cr->completePhase(3);

            // ===== PHASE 4: Pro Enrichment (optional) =====
            $cr->startPhase(4);
            if (!($settings['skip_enrichment'] ?? false)) {
                // TODO: enrichBusinessDetails() for businesses with websites
            }
            $cr->completePhase(4);

            // ===== PHASE 5: Verification =====
            $cr->startPhase(5);
            // TODO: Verify data quality, check for gaps
            $cr->completePhase(5);

            // ===== PHASE 6: Cross-Platform Seeding =====
            $cr->startPhase(6);
            // TODO: Seed DowntownGuide, GoEventCity, AlphaSite, CRM
            $cr->completePhase(6);

            $cr->markCompleted();

            Log::info('Community rollout completed', [
                'community' => $community->name,
                'businesses' => $discoveredCount,
                'with_websites' => $withWebsites,
                'cost' => $cr->api_cost_estimate,
            ]);

        } catch (Exception $e) {
            Log::error('Community rollout failed', [
                'community' => $community->name,
                'phase' => $cr->current_phase,
                'error' => $e->getMessage(),
            ]);

            $cr->failPhase($cr->current_phase, $e->getMessage());

            if ($cr->retry_count >= 2) {
                $cr->markFailed();
            } else {
                $cr->increment('retry_count');
                throw $e; // Let Laravel retry
            }
        }

        // Dispatch next batch after this community completes
        $stateRollout = $cr->stateRollout->fresh();
        if ($stateRollout->status === StateRollout::STATUS_IN_PROGRESS) {
            app(StateRolloutOrchestratorService::class)->dispatchNextBatch($stateRollout);
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Community rollout job permanently failed', [
            'community_rollout_id' => $this->communityRollout->id,
            'error' => $exception->getMessage(),
        ]);

        $this->communityRollout->markFailed();
    }
}
```

---

## Implementation Steps

1. Create `app/Services/Rollout/` directory.
2. Create `StateRolloutOrchestratorService.php`.
3. Create `app/Jobs/Rollout/` directory.
4. Create `ProcessCommunityRolloutJob.php`.
5. Register the service in the container if needed (Laravel auto-discovers it).

---

## Verification

```bash
# Verify files exist and classes load
php artisan tinker --execute="
    new \App\Services\Rollout\StateRolloutOrchestratorService();
    echo 'Orchestrator: OK' . PHP_EOL;
    echo 'Job class exists: ' . (class_exists(\App\Jobs\Rollout\ProcessCommunityRolloutJob::class) ? 'YES' : 'NO') . PHP_EOL;
"

# Dry run: check that communities exist for a state
php artisan tinker --execute="
    \$count = \App\Models\Community::where('state_code', 'FL')->orWhere('state', 'FL')->count();
    echo 'FL communities: ' . \$count . PHP_EOL;
"
```
