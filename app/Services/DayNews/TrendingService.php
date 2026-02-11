<?php

declare(strict_types=1);

namespace App\Services\DayNews;

use App\Models\ArticleComment;
use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class TrendingService
{
    /**
     * Calculate trending score for an article
     */
    public function calculateTrendingScore(DayNewsPost $post, string $timePeriod = 'now'): float
    {
        $now = now();
        $timeRange = match ($timePeriod) {
            'hour' => $now->copy()->subHour(),
            'day' => $now->copy()->subDay(),
            'week' => $now->copy()->subWeek(),
            'month' => $now->copy()->subMonth(),
            default => $now->copy()->subHour(), // 'now' defaults to last hour
        };

        // Get engagement metrics
        $views = $post->view_count ?? 0;
        $comments = $post->comments()->where('created_at', '>=', $timeRange)->count();
        $likes = $post->ratings()->where('created_at', '>=', $timeRange)->count();
        $shares = $post->activities()
            ->where('type', 'article_share')
            ->where('created_at', '>=', $timeRange)
            ->count();

        // Weighted scoring
        $score = ($views * 0.1) + ($comments * 5) + ($likes * 3) + ($shares * 8);

        // Recency boost (more recent = higher score)
        $hoursSincePublished = $post->published_at ? $now->diffInHours($post->published_at) : 999;
        $recencyMultiplier = max(0.5, 1 - ($hoursSincePublished / 168)); // Decay over 1 week

        return $score * $recencyMultiplier;
    }

    /**
     * Get trending stories
     */
    public function getTrendingStories(string $timePeriod = 'now', ?Region $region = null, int $limit = 20): array
    {
        $query = DayNewsPost::published()
            ->with(['author', 'regions'])
            ->where('published_at', '>=', now()->subMonth()); // Only consider recent articles

        if ($region) {
            $query->whereHas('regions', function ($q) use ($region) {
                $q->where('region_id', $region->id);
            });
        }

        $posts = $query->get();

        // Calculate scores and sort
        $scoredPosts = $posts->map(function ($post) use ($timePeriod) {
            return [
                'post' => $post,
                'score' => $this->calculateTrendingScore($post, $timePeriod),
            ];
        })->sortByDesc('score')->take($limit);

        return $scoredPosts->pluck('post')->values()->all();
    }

    /**
     * Get trending topics
     */
    public function getTrendingTopics(string $timePeriod = 'now', ?Region $region = null, int $limit = 10): array
    {
        $timeRange = match ($timePeriod) {
            'hour' => now()->subHour(),
            'day' => now()->subDay(),
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            default => now()->subHour(),
        };

        $query = Tag::whereHas('posts', function ($q) use ($timeRange, $region) {
            $q->published()
                ->where('published_at', '>=', $timeRange);
            if ($region) {
                $q->whereHas('regions', function ($regionQuery) use ($region) {
                    $regionQuery->where('region_id', $region->id);
                });
            }
        })
            ->withCount(['posts' => function ($q) use ($timeRange) {
                $q->published()->where('published_at', '>=', $timeRange);
            }])
            ->orderBy('posts_count', 'desc')
            ->limit($limit);

        return $query->get()->map(fn ($tag) => [
            'id' => $tag->id,
            'name' => $tag->name,
            'slug' => $tag->slug,
            'count' => $tag->posts_count,
        ])->toArray();
    }

    /**
     * Get trending categories
     */
    public function getTrendingCategories(string $timePeriod = 'now', ?Region $region = null, int $limit = 10): array
    {
        $timeRange = match ($timePeriod) {
            'hour' => now()->subHour(),
            'day' => now()->subDay(),
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            default => now()->subHour(),
        };

        $query = DayNewsPost::published()
            ->where('published_at', '>=', $timeRange)
            ->whereNotNull('category')
            ->selectRaw('category, COUNT(*) as count, SUM(view_count) as total_views')
            ->groupBy('category')
            ->orderBy('total_views', 'desc')
            ->limit($limit);

        if ($region) {
            $query->whereHas('regions', function ($q) use ($region) {
                $q->where('region_id', $region->id);
            });
        }

        return $query->get()->map(fn ($item) => [
            'name' => ucfirst(str_replace('_', ' ', $item->category)),
            'count' => $item->count,
            'views' => $item->total_views,
        ])->toArray();
    }

    /**
     * Get trending people (authors)
     */
    public function getTrendingPeople(string $timePeriod = 'now', ?Region $region = null, int $limit = 10): array
    {
        $timeRange = match ($timePeriod) {
            'hour' => now()->subHour(),
            'day' => now()->subDay(),
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            default => now()->subHour(),
        };

        $query = User::whereHas('authoredDayNewsPosts', function ($q) use ($timeRange, $region) {
            $q->published()->where('published_at', '>=', $timeRange);
            if ($region) {
                $q->whereHas('regions', function ($regionQuery) use ($region) {
                    $regionQuery->where('region_id', $region->id);
                });
            }
        })
            ->withCount(['authoredDayNewsPosts' => function ($q) use ($timeRange) {
                $q->published()->where('published_at', '>=', $timeRange);
            }])
            ->orderBy('authored_day_news_posts_count', 'desc')
            ->limit($limit);

        return $query->get()->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->profile_photo_url ?? $user->avatar,
            'posts_count' => $user->authored_day_news_posts_count,
        ])->toArray();
    }

    /**
     * Get community pulse data
     */
    public function getCommunityPulse(?Region $region = null): array
    {
        $driver = DB::connection()->getDriverName();
        $hourFunc = $driver === 'sqlite' ? "strftime('%H', published_at)" : 'HOUR(published_at)';

        $query = DayNewsPost::published()
            ->where('published_at', '>=', now()->subDay())
            ->selectRaw("{$hourFunc} as hour, COUNT(*) as count")
            ->groupBy('hour')
            ->orderBy('hour');

        if ($region) {
            $query->whereHas('regions', function ($q) use ($region) {
                $q->where('region_id', $region->id);
            });
        }

        $hourlyData = $query->get()->keyBy('hour')->map(fn ($item) => $item->count)->toArray();

        // Fill in missing hours with 0
        $pulse = [];
        for ($i = 0; $i < 24; $i++) {
            $pulse[$i] = $hourlyData[$i] ?? 0;
        }

        return [
            'hourly' => $pulse,
            'peak_hour' => array_search(max($pulse), $pulse),
            'total_today' => array_sum($pulse),
        ];
    }

    /**
     * Get community engagement statistics for the trending page
     *
     * @return array{comment_count: int, contributor_count: int, share_count: int, reaction_count: int}
     */
    public function getEngagementStats(string $timePeriod = 'now', ?Region $region = null): array
    {
        $timeRange = match ($timePeriod) {
            'hour' => now()->subHour(),
            'day' => now()->subDay(),
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            default => now()->subHour(),
        };

        // Count comments on articles within the time period
        $commentQuery = ArticleComment::where('created_at', '>=', $timeRange)
            ->where('is_active', true);

        if ($region) {
            $commentQuery->whereHas('article', function ($q) use ($region) {
                $q->published()->whereHas('regions', function ($regionQuery) use ($region) {
                    $regionQuery->where('region_id', $region->id);
                });
            });
        }

        $commentCount = $commentQuery->count();

        // Count unique contributors (authors who published in the time period)
        $contributorQuery = User::whereHas('authoredDayNewsPosts', function ($q) use ($timeRange, $region) {
            $q->published()->where('published_at', '>=', $timeRange);
            if ($region) {
                $q->whereHas('regions', function ($regionQuery) use ($region) {
                    $regionQuery->where('region_id', $region->id);
                });
            }
        });

        $contributorCount = $contributorQuery->count();

        // Count shares of day_news_post content in the time period
        $shareCount = DB::table('content_shares')
            ->where('shareable_type', 'day_news_post')
            ->where('created_at', '>=', $timeRange)
            ->count();

        // Count reactions on day_news_post content in the time period
        $reactionCount = DB::table('post_reactions')
            ->where('post_type', 'day_news_post')
            ->where('created_at', '>=', $timeRange)
            ->count();

        return [
            'comment_count' => $commentCount,
            'contributor_count' => $contributorCount,
            'share_count' => $shareCount,
            'reaction_count' => $reactionCount,
        ];
    }
}
