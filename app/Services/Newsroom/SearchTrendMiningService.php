<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\SearchTrend;
use App\Models\SeoTarget;
use App\Services\News\SerpApiService;
use Exception;
use Illuminate\Support\Facades\Log;

final class SearchTrendMiningService
{
    public function __construct(
        private readonly SerpApiService $serpApi,
    ) {}

    /**
     * Mine trending searches for a region and identify content gaps.
     * Stores in search_trends and seo_targets tables.
     */
    public function mineForRegion(Region $region): array
    {
        $stats = ['trends_stored' => 0, 'targets_created' => 0];

        $trending = $this->serpApi->fetchTrendingSearches($region, 30);
        if (empty($trending)) {
            return $stats;
        }

        foreach ($trending as $item) {
            $query = mb_trim($item['query'] ?? '');
            if (empty($query) || mb_strlen($query) < 3) {
                continue;
            }

            $existing = SearchTrend::where('region_id', $region->id)
                ->where('query', $query)
                ->first();

            if ($existing) {
                $existing->update([
                    'search_volume' => $item['search_volume'] ?? $existing->search_volume,
                    'trend_direction' => $item['trend_direction'] ?? $existing->trend_direction,
                    'last_checked_at' => now(),
                ]);
            } else {
                SearchTrend::create([
                    'region_id' => $region->id,
                    'query' => $query,
                    'search_volume' => $item['search_volume'] ?? null,
                    'trend_direction' => $item['trend_direction'] ?? 'rising',
                    'last_checked_at' => now(),
                ]);
            }
            $stats['trends_stored']++;

            $gapScore = $this->calculateContentGapScore($region, $query);
            if ($gapScore > 0) {
                SeoTarget::updateOrCreate(
                    [
                        'region_id' => $region->id,
                        'target_keyword' => $query,
                    ],
                    [
                        'search_volume' => $item['search_volume'] ?? null,
                        'competition_level' => 'medium',
                        'content_gap_score' => $gapScore,
                    ]
                );
                $stats['targets_created']++;
            }
        }

        return $stats;
    }

    /**
     * Mine trends for all active regions.
     */
    public function mineAllRegions(): array
    {
        $totals = ['regions' => 0, 'trends_stored' => 0, 'targets_created' => 0];

        foreach (Region::where('is_active', true)->get() as $region) {
            try {
                $stats = $this->mineForRegion($region);
                $totals['regions']++;
                $totals['trends_stored'] += $stats['trends_stored'];
                $totals['targets_created'] += $stats['targets_created'];
            } catch (Exception $e) {
                Log::error('SearchTrendMining: Region failed', [
                    'region_id' => $region->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $totals;
    }

    /**
     * Get top unassigned SEO targets for a region (for FillerBucketService, etc.).
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, SeoTarget>
     */
    public function getTopTargetsForRegion(Region $region, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return SeoTarget::unassigned()
            ->where('region_id', $region->id)
            ->byGapScore('desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Calculate content gap score: higher = we have no/small coverage for this query.
     */
    private function calculateContentGapScore(Region $region, string $query): int
    {
        $pattern = '%'.addcslashes($query, '%_\\').'%';
        $hasCoverage = DayNewsPost::whereHas('regions', fn ($q) => $q->where('region_id', $region->id))
            ->where('status', 'published')
            ->where(function ($q) use ($pattern) {
                $q->where('title', 'like', $pattern)
                    ->orWhere('content', 'like', $pattern);
            })
            ->exists();

        return $hasCoverage ? 0 : 70;
    }
}
