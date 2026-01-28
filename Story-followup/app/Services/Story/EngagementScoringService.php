<?php

declare(strict_types=1);

namespace App\Services\Story;

use App\Models\NewsArticle;
use App\Models\Region;
use App\Models\StoryThread;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Engagement Scoring Service
 * 
 * Calculates engagement scores for articles and determines thresholds
 * for what constitutes "high engagement" in each category/region.
 */
class EngagementScoringService
{
    // Default weights for engagement components
    private const DEFAULT_WEIGHTS = [
        'views' => 0.3,
        'comments' => 0.35,
        'shares' => 0.25,
        'time_on_page' => 0.10,
    ];

    // Decay factor for older articles
    private const RECENCY_DECAY_DAYS = 7;
    private const RECENCY_DECAY_FACTOR = 0.9;

    /**
     * Calculate engagement score for an article (0-100)
     */
    public function calculateArticleScore(NewsArticle $article): float
    {
        $thresholds = $this->getThresholdsForCategory(
            $article->region_id,
            $article->category ?? 'general'
        );

        // Normalize each metric against category averages
        $viewsScore = $this->normalizeMetric(
            $article->views ?? 0,
            $thresholds['avg_views'],
            $thresholds['std_dev_views']
        );

        $commentsScore = $this->normalizeMetric(
            $article->comments_count ?? 0,
            $thresholds['avg_comments'],
            $thresholds['std_dev_comments'] ?? $thresholds['avg_comments'] * 0.5
        );

        $sharesScore = $this->normalizeMetric(
            $article->shares ?? 0,
            $thresholds['avg_shares'] ?? $thresholds['avg_views'] * 0.1,
            $thresholds['std_dev_shares'] ?? $thresholds['avg_views'] * 0.05
        );

        // Time on page (if available)
        $timeScore = 50; // Default to median
        if ($article->avg_time_on_page) {
            $timeScore = $this->normalizeMetric(
                $article->avg_time_on_page,
                120, // 2 minute average
                60   // 1 minute std dev
            );
        }

        // Calculate weighted score
        $weights = self::DEFAULT_WEIGHTS;
        $score = (
            $viewsScore * $weights['views'] +
            $commentsScore * $weights['comments'] +
            $sharesScore * $weights['shares'] +
            $timeScore * $weights['time_on_page']
        );

        // Apply recency bonus/penalty
        $score = $this->applyRecencyFactor($score, $article->published_at);

        return min(100, max(0, $score));
    }

    /**
     * Calculate engagement score for a story thread
     */
    public function calculateThreadScore(StoryThread $thread): float
    {
        $articles = $thread->articles()->get();

        if ($articles->isEmpty()) {
            return 0;
        }

        // Calculate individual scores
        $scores = $articles->map(function ($article) {
            return $this->calculateArticleScore($article);
        });

        // Weight more recent articles higher
        $weightedSum = 0;
        $weightTotal = 0;

        foreach ($scores as $index => $score) {
            $weight = 1 + ($index * 0.2); // Later articles weighted higher
            $weightedSum += $score * $weight;
            $weightTotal += $weight;
        }

        $avgScore = $weightTotal > 0 ? $weightedSum / $weightTotal : 0;

        // Bonus for thread momentum (increasing engagement)
        $momentum = $this->calculateMomentum($articles);
        $avgScore += $momentum * 10;

        // Bonus for comment activity (indicates reader investment)
        $commentBonus = min(10, $thread->total_comments / 10);
        $avgScore += $commentBonus;

        return min(100, max(0, $avgScore));
    }

    /**
     * Determine if an article has "high engagement" for its category
     */
    public function hasHighEngagement(NewsArticle $article, float $percentileThreshold = 75): bool
    {
        $score = $this->calculateArticleScore($article);
        return $score >= $percentileThreshold;
    }

    /**
     * Get top engaging articles in a region
     */
    public function getTopEngagingArticles(Region $region, int $days = 7, int $limit = 20): Collection
    {
        $articles = NewsArticle::where('region_id', $region->id)
            ->where('published_at', '>=', now()->subDays($days))
            ->where('status', 'published')
            ->get();

        return $articles
            ->map(function ($article) {
                $article->engagement_score = $this->calculateArticleScore($article);
                return $article;
            })
            ->sortByDesc('engagement_score')
            ->take($limit)
            ->values();
    }

    /**
     * Get category thresholds for a region
     */
    public function getThresholdsForCategory(string $regionId, string $category): array
    {
        $cacheKey = "engagement_thresholds:{$regionId}:{$category}";

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($regionId, $category) {
            // Calculate from recent articles
            $stats = NewsArticle::where('region_id', $regionId)
                ->where('category', $category)
                ->where('published_at', '>=', now()->subMonths(3))
                ->where('status', 'published')
                ->selectRaw('
                    AVG(views) as avg_views,
                    STDDEV(views) as std_dev_views,
                    AVG(comments_count) as avg_comments,
                    STDDEV(comments_count) as std_dev_comments,
                    AVG(shares) as avg_shares,
                    STDDEV(shares) as std_dev_shares,
                    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY views) as p75_views,
                    PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY views) as p90_views
                ')
                ->first();

            // Fallback to region-wide if category has insufficient data
            if (!$stats || !$stats->avg_views) {
                $stats = NewsArticle::where('region_id', $regionId)
                    ->where('published_at', '>=', now()->subMonths(3))
                    ->where('status', 'published')
                    ->selectRaw('
                        AVG(views) as avg_views,
                        STDDEV(views) as std_dev_views,
                        AVG(comments_count) as avg_comments,
                        AVG(shares) as avg_shares
                    ')
                    ->first();
            }

            return [
                'avg_views' => $stats->avg_views ?? 100,
                'std_dev_views' => $stats->std_dev_views ?? 50,
                'avg_comments' => $stats->avg_comments ?? 5,
                'std_dev_comments' => $stats->std_dev_comments ?? 3,
                'avg_shares' => $stats->avg_shares ?? 10,
                'std_dev_shares' => $stats->std_dev_shares ?? 5,
                'p75_views' => $stats->p75_views ?? 150,
                'p90_views' => $stats->p90_views ?? 300,
            ];
        });
    }

    /**
     * Update stored thresholds for a region (run periodically)
     */
    public function recalculateThresholds(Region $region): void
    {
        $categories = NewsArticle::where('region_id', $region->id)
            ->where('published_at', '>=', now()->subMonths(3))
            ->distinct()
            ->pluck('category');

        foreach ($categories as $category) {
            $cacheKey = "engagement_thresholds:{$region->id}:{$category}";
            Cache::forget($cacheKey);
            
            // Recalculate and cache
            $this->getThresholdsForCategory($region->id, $category);
        }

        Log::info('EngagementScoring: Recalculated thresholds', [
            'region_id' => $region->id,
            'categories' => $categories->count(),
        ]);
    }

    /**
     * Get articles exceeding engagement thresholds (candidates for follow-up)
     */
    public function getHighEngagementUnthreaded(Region $region, int $days = 3): Collection
    {
        $articles = NewsArticle::where('region_id', $region->id)
            ->where('published_at', '>=', now()->subDays($days))
            ->where('status', 'published')
            ->whereDoesntHave('storyThreads') // Not already in a thread
            ->get();

        return $articles
            ->map(function ($article) {
                $article->engagement_score = $this->calculateArticleScore($article);
                return $article;
            })
            ->filter(function ($article) {
                return $article->engagement_score >= 75;
            })
            ->sortByDesc('engagement_score')
            ->values();
    }

    /**
     * Calculate follow-up priority based on engagement trends
     */
    public function calculateFollowUpPriority(StoryThread $thread): int
    {
        $baseScore = $this->calculateThreadScore($thread);
        $priority = 0;

        // High engagement base
        if ($baseScore >= 80) $priority += 30;
        elseif ($baseScore >= 60) $priority += 20;
        elseif ($baseScore >= 40) $priority += 10;

        // Comment activity (reader investment)
        if ($thread->total_comments >= 100) $priority += 25;
        elseif ($thread->total_comments >= 50) $priority += 15;
        elseif ($thread->total_comments >= 20) $priority += 10;

        // Recency of engagement
        $latestArticle = $thread->articles()->latest('published_at')->first();
        if ($latestArticle) {
            $daysSince = $latestArticle->published_at->diffInDays(now());
            if ($daysSince <= 1) $priority += 20;
            elseif ($daysSince <= 3) $priority += 15;
            elseif ($daysSince <= 7) $priority += 10;
        }

        // Momentum bonus
        $momentum = $this->calculateMomentum($thread->articles);
        if ($momentum > 0) $priority += min(15, $momentum * 10);

        // Story type priority
        $typePriority = $this->getTypePriority($thread);
        $priority += $typePriority;

        return min(100, $priority);
    }

    // =========================================================================
    // PRIVATE METHODS
    // =========================================================================

    /**
     * Normalize a metric to 0-100 score using z-score
     */
    private function normalizeMetric(float $value, float $mean, float $stdDev): float
    {
        if ($stdDev <= 0) {
            $stdDev = max(1, $mean * 0.3);
        }

        $zScore = ($value - $mean) / $stdDev;
        
        // Convert z-score to 0-100 scale (assuming normal distribution)
        // z = -2 → 0, z = 0 → 50, z = 2 → 100
        $normalized = 50 + ($zScore * 25);

        return min(100, max(0, $normalized));
    }

    /**
     * Apply recency factor to score
     */
    private function applyRecencyFactor(float $score, ?\DateTime $publishedAt): float
    {
        if (!$publishedAt) {
            return $score;
        }

        $daysOld = now()->diffInDays($publishedAt);

        if ($daysOld <= self::RECENCY_DECAY_DAYS) {
            // Slight bonus for very recent articles
            return $score * (1 + (self::RECENCY_DECAY_DAYS - $daysOld) * 0.01);
        }

        // Decay for older articles
        $decayPeriods = ($daysOld - self::RECENCY_DECAY_DAYS) / 7;
        $decayFactor = pow(self::RECENCY_DECAY_FACTOR, $decayPeriods);

        return $score * $decayFactor;
    }

    /**
     * Calculate engagement momentum (is it increasing or decreasing?)
     */
    private function calculateMomentum(Collection $articles): float
    {
        if ($articles->count() < 2) {
            return 0;
        }

        $sorted = $articles->sortBy('published_at')->values();
        
        // Compare first half to second half
        $midpoint = (int) floor($sorted->count() / 2);
        $firstHalf = $sorted->take($midpoint);
        $secondHalf = $sorted->skip($midpoint);

        $firstAvgViews = $firstHalf->avg('views') ?? 0;
        $secondAvgViews = $secondHalf->avg('views') ?? 0;

        if ($firstAvgViews <= 0) {
            return 0;
        }

        // Positive = increasing, negative = decreasing
        $momentum = ($secondAvgViews - $firstAvgViews) / $firstAvgViews;

        return max(-1, min(1, $momentum));
    }

    /**
     * Get priority bonus based on story type
     */
    private function getTypePriority(StoryThread $thread): int
    {
        $categoryPriorities = [
            'crime' => 15,
            'public_safety' => 15,
            'accident' => 12,
            'legal' => 10,
            'politics' => 10,
            'government' => 8,
            'health' => 8,
            'environment' => 5,
            'business' => 5,
            'community' => 3,
        ];

        return $categoryPriorities[$thread->category] ?? 5;
    }
}
