<?php

declare(strict_types=1);

namespace App\Jobs\Rollout;

use App\Models\Business;
use App\Models\Community;
use App\Services\News\BusinessDiscoveryService;
use App\Services\News\GooglePlacesService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class ProcessMonthlyRefreshJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 3600;

    public $tries = 1;

    /**
     * @param  array{new: int, updated: int, absent: int, deactivated: int}  $result
     */
    public function __construct(
        public int $batchNumber = 0,
        public int $batchSize = 33,
    ) {
        $this->onQueue('refresh');
    }

    public function handle(
        GooglePlacesService $googlePlaces,
        BusinessDiscoveryService $businessDiscovery,
    ): void {
        $communities = Community::whereHas('regions')
            ->orderBy('id')
            ->offset($this->batchNumber * $this->batchSize)
            ->limit($this->batchSize)
            ->get();

        if ($communities->isEmpty()) {
            Log::info('Monthly refresh: No more communities to process', [
                'batch' => $this->batchNumber,
            ]);

            return;
        }

        Log::info('Monthly refresh: Starting batch', [
            'batch' => $this->batchNumber,
            'communities' => $communities->count(),
        ]);

        $stats = ['new_businesses' => 0, 'updated' => 0, 'marked_absent' => 0, 'deactivated' => 0];

        foreach ($communities as $community) {
            try {
                $result = $this->refreshCommunity($community, $googlePlaces, $businessDiscovery);
                $stats['new_businesses'] += $result['new'];
                $stats['updated'] += $result['updated'];
                $stats['marked_absent'] += $result['absent'];
                $stats['deactivated'] += $result['deactivated'];
            } catch (Exception $e) {
                Log::error('Monthly refresh failed for community', [
                    'community' => $community->name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Monthly refresh: Batch complete', [
            'batch' => $this->batchNumber,
            'stats' => $stats,
        ]);

        $nextBatch = $this->batchNumber + 1;
        $hasMore = Community::whereHas('regions')
            ->offset($nextBatch * $this->batchSize)
            ->limit(1)
            ->exists();

        if ($hasMore) {
            self::dispatch($nextBatch, $this->batchSize)
                ->onQueue('refresh')
                ->delay(now()->addDay());
        }
    }

    /**
     * @return array{new: int, updated: int, absent: int, deactivated: int}
     */
    private function refreshCommunity(
        Community $community,
        GooglePlacesService $googlePlaces,
        BusinessDiscoveryService $businessDiscovery,
    ): array {
        $region = $community->regions()->first();
        if (! $region) {
            return ['new' => 0, 'updated' => 0, 'absent' => 0, 'deactivated' => 0];
        }

        $denseCategories = config('news-workflow.business_discovery.dense_categories', []);
        $stats = ['new' => 0, 'updated' => 0, 'absent' => 0, 'deactivated' => 0];
        $discoveredPlaceIds = [];

        foreach ($denseCategories as $category) {
            try {
                $results = $googlePlaces->searchTextPlaces($region, $category);

                foreach ($results as $data) {
                    $placeId = $data['google_place_id'] ?? null;
                    if (! $placeId) {
                        continue;
                    }

                    $discoveredPlaceIds[] = $placeId;

                    $existing = Business::where('google_place_id', $placeId)->first();

                    if ($existing) {
                        $changed = false;
                        if ($existing->name !== ($data['name'] ?? $existing->name)) {
                            $changed = true;
                        }
                        if ($existing->address !== ($data['address'] ?? $existing->address)) {
                            $changed = true;
                        }

                        $existing->update([
                            'last_refreshed_at' => now(),
                            'consecutive_absences' => 0,
                        ]);

                        if ($changed) {
                            $businessDiscovery->upsertBusiness($data, $region);
                            $stats['updated']++;
                        }
                    } else {
                        $business = $businessDiscovery->upsertBusiness($data, $region);
                        $businessDiscovery->assignToRegion($business, $region);
                        $stats['new']++;
                    }
                }

                usleep(100 * 1000);
            } catch (Exception $e) {
                Log::warning('Monthly refresh: Category failed', [
                    'community' => $community->name,
                    'category' => $category,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $communityBusinesses = Business::where('community_id', $community->id)
            ->where('is_active', true)
            ->whereNotNull('google_place_id')
            ->get();

        foreach ($communityBusinesses as $business) {
            if (! in_array($business->google_place_id, $discoveredPlaceIds, true)) {
                $business->increment('consecutive_absences');
                $business->update(['last_refreshed_at' => now()]);
                $stats['absent']++;

                if ($business->consecutive_absences >= 3) {
                    $business->update(['is_active' => false]);
                    $stats['deactivated']++;

                    Log::info('Monthly refresh: Business deactivated after 3 absences', [
                        'business' => $business->name,
                        'place_id' => $business->google_place_id,
                    ]);
                }
            }
        }

        return $stats;
    }
}
