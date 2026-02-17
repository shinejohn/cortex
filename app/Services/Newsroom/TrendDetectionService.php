<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\Region;
use App\Models\SearchTrend;
use App\Services\News\SerpApiService;
use Exception;
use Illuminate\Support\Facades\Log;

final class TrendDetectionService
{
    public function __construct(
        private readonly SerpApiService $serpApi,
    ) {}

    /**
     * Analyze cross-community patterns. Detect topics trending in multiple regions.
     * Generates automated trend articles. Feeds into Top List topics + Filler replenishment.
     */
    public function detectCrossRegionTrends(): array
    {
        $trendsByQuery = SearchTrend::where('last_checked_at', '>=', now()->subDays(7))
            ->get()
            ->groupBy('query')
            ->map(fn ($group) => [
                'query' => $group->first()->query,
                'region_count' => $group->pluck('region_id')->unique()->count(),
                'regions' => $group->pluck('region_id')->unique()->values()->toArray(),
                'avg_volume' => $group->avg('search_volume'),
            ])
            ->filter(fn ($t) => $t['region_count'] >= 2)
            ->sortByDesc('region_count')
            ->values()
            ->toArray();

        return $trendsByQuery;
    }

    /**
     * Get trending topics for Top List topic selection and Filler bucket replenishment.
     *
     * @return array<int, string>
     */
    public function getTrendingTopicsForContent(): array
    {
        $crossRegion = $this->detectCrossRegionTrends();

        return array_map(fn ($t) => $t['query'], array_slice($crossRegion, 0, 10));
    }

    /**
     * Sync trends from SerpAPI for all regions (delegates to SearchTrendMiningService pattern).
     */
    public function refreshTrendsForAllRegions(): array
    {
        $totals = ['regions' => 0, 'trends' => 0];

        foreach (Region::where('is_active', true)->get() as $region) {
            try {
                $items = $this->serpApi->fetchTrendingSearches($region, 15);
                foreach ($items as $item) {
                    $query = mb_trim($item['query'] ?? '');
                    if (mb_strlen($query) < 3) {
                        continue;
                    }
                    SearchTrend::updateOrCreate(
                        ['region_id' => $region->id, 'query' => $query],
                        [
                            'search_volume' => $item['search_volume'] ?? null,
                            'trend_direction' => $item['trend_direction'] ?? 'stable',
                            'last_checked_at' => now(),
                        ]
                    );
                    $totals['trends']++;
                }
                $totals['regions']++;
            } catch (Exception $e) {
                Log::error('TrendDetection: Region failed', [
                    'region_id' => $region->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $totals;
    }
}
