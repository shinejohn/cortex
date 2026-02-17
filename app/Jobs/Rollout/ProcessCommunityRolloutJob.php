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

final class ProcessCommunityRolloutJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 1800;

    public $tries = 3;

    public $backoff = [60, 300, 900];

    public function __construct(
        public CommunityRollout $communityRollout
    ) {}

    public function handle(
        BusinessDiscoveryService $businessDiscovery,
        GooglePlacesService $googlePlaces,
    ): void {
        $cr = $this->communityRollout;
        $community = $cr->community;
        $region = $community->regions()->first();

        if (! $region) {
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
            $cr->startPhase(1);

            $denseCategories = config('news-workflow.business_discovery.dense_categories', []);
            $sparseCategories = config('news-workflow.business_discovery.sparse_categories', []);
            $textQueries = config('news-workflow.business_discovery.text_search_queries', []);
            $discoveredCount = 0;
            $withWebsites = 0;

            foreach ($denseCategories as $category) {
                try {
                    $businesses = $googlePlaces->searchTextPlaces($region, $category);
                    foreach ($businesses as $data) {
                        $business = $businessDiscovery->upsertBusiness($data, $region);
                        $businessDiscovery->assignToRegion($business, $region, $cr);
                        $discoveredCount++;
                        if (! empty($data['website'])) {
                            $withWebsites++;
                        }
                    }

                    $pages = max(1, (int) ceil(count($businesses) / 20));
                    $cr->logApiUsage('google_places', 'text_search', 'essentials', $pages, $pages * 0.005, count($businesses));

                    usleep($throttleMs * 1000);
                } catch (Exception $e) {
                    Log::warning('Discovery failed for dense category', [
                        'category' => $category,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            foreach ($sparseCategories as $category) {
                try {
                    $businesses = $googlePlaces->discoverBusinessesForCategory($region, $category);
                    foreach ($businesses as $data) {
                        $business = $businessDiscovery->upsertBusiness($data, $region);
                        $businessDiscovery->assignToRegion($business, $region, $cr);
                        $discoveredCount++;
                        if (! empty($data['website'])) {
                            $withWebsites++;
                        }
                    }

                    $cr->logApiUsage('google_places', 'nearby_search', 'essentials', 1, 0.005, count($businesses));
                    usleep($throttleMs * 1000);
                } catch (Exception $e) {
                    Log::warning('Discovery failed for sparse category', [
                        'category' => $category,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            foreach ($textQueries as $query) {
                try {
                    $businesses = $googlePlaces->searchTextQuery($region, $query);
                    foreach ($businesses as $data) {
                        $business = $businessDiscovery->upsertBusiness($data, $region);
                        $businessDiscovery->assignToRegion($business, $region, $cr);
                        $discoveredCount++;
                        if (! empty($data['website'])) {
                            $withWebsites++;
                        }
                    }
                    $cr->logApiUsage('google_places', 'text_search', 'essentials', 1, 0.005, count($businesses));
                    usleep($throttleMs * 1000);
                } catch (Exception $e) {
                    Log::warning('Discovery failed for text query', [
                        'query' => $query,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $cr->update([
                'businesses_discovered' => $discoveredCount,
                'businesses_with_websites' => $withWebsites,
            ]);
            $cr->completePhase(1);

            $cr->startPhase(2);
            $cr->completePhase(2);

            $cr->startPhase(3);
            $cr->completePhase(3);

            $cr->startPhase(4);
            $cr->completePhase(4);

            $cr->startPhase(5);
            $cr->completePhase(5);

            $cr->startPhase(6);
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
                throw $e;
            }
        }

        $stateRollout = $cr->stateRollout->fresh();
        if ($stateRollout && $stateRollout->status === StateRollout::STATUS_IN_PROGRESS) {
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
