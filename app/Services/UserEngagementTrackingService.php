<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SocialPost;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class UserEngagementTrackingService
{
    private const ENGAGEMENT_TYPES = [
        'post_view' => 1,
        'post_like' => 3,
        'post_comment' => 5,
        'post_share' => 7,
        'profile_view' => 2,
        'scroll_depth' => 1,
        'time_spent' => 0.1, // per second
    ];

    public function trackPostView(User $user, SocialPost $post): void
    {
        $this->recordEngagement($user, 'post_view', [
            'post_id' => $post->id,
            'post_author_id' => $post->user_id,
            'content_type' => $this->determineContentType($post),
        ]);
    }

    public function trackPostInteraction(User $user, SocialPost $post, string $interactionType): void
    {
        $this->recordEngagement($user, $interactionType, [
            'post_id' => $post->id,
            'post_author_id' => $post->user_id,
            'content_type' => $this->determineContentType($post),
        ]);

        // Update real-time engagement metrics
        $this->updateEngagementMetrics($user, $post, $interactionType);
    }

    public function trackScrollDepth(User $user, int $depth, array $viewedPosts = []): void
    {
        $this->recordEngagement($user, 'scroll_depth', [
            'depth' => $depth,
            'viewed_posts' => $viewedPosts,
        ]);
    }

    public function trackTimeSpent(User $user, int $seconds, ?SocialPost $post = null): void
    {
        $data = ['duration' => $seconds];

        if ($post) {
            $data['post_id'] = $post->id;
            $data['post_author_id'] = $post->user_id;
        }

        $this->recordEngagement($user, 'time_spent', $data);
    }

    public function trackSessionStart(User $user): void
    {
        $cacheKey = "user_session:{$user->id}";
        Cache::put($cacheKey, [
            'start_time' => now(),
            'posts_viewed' => [],
            'interactions_count' => 0,
        ], now()->addHours(2));

        // Update last active timestamp
        $user->update(['last_active_at' => now()]);
    }

    public function trackSessionEnd(User $user): void
    {
        $cacheKey = "user_session:{$user->id}";
        $sessionData = Cache::get($cacheKey);

        if ($sessionData) {
            $sessionDuration = now()->diffInSeconds($sessionData['start_time']);

            $this->recordEngagement($user, 'session_end', [
                'duration' => $sessionDuration,
                'posts_viewed' => count($sessionData['posts_viewed']),
                'interactions_count' => $sessionData['interactions_count'],
            ]);

            Cache::forget($cacheKey);
        }
    }

    public function getEngagementScore(User $user, int $days = 7): float
    {
        $cacheKey = "engagement_score:{$user->id}:{$days}";

        return Cache::remember($cacheKey, now()->addHours(1), function () use ($user, $days) {
            $engagements = $this->getRecentEngagements($user, $days);

            $totalScore = 0;
            foreach ($engagements as $engagement) {
                $score = self::ENGAGEMENT_TYPES[$engagement->type] ?? 0;

                // Apply time decay (recent engagement gets higher weight)
                $hoursAgo = now()->diffInHours($engagement->created_at);
                $decay = exp(-$hoursAgo / (24 * $days));

                $totalScore += $score * $decay;
            }

            return $totalScore;
        });
    }

    public function getUserRetentionMetrics(User $user): array
    {
        $cacheKey = "retention_metrics:{$user->id}";

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($user) {
            return [
                'daily_active_days_last_week' => $this->getDailyActiveDays($user, 7),
                'weekly_active_weeks_last_month' => $this->getWeeklyActiveWeeks($user, 4),
                'average_session_duration' => $this->getAverageSessionDuration($user),
                'posts_per_session' => $this->getAveragePostsPerSession($user),
                'engagement_trend' => $this->getEngagementTrend($user),
                'retention_risk' => $this->calculateRetentionRisk($user),
            ];
        });
    }

    public function getFeedOptimizationData(User $user): array
    {
        $cacheKey = "feed_optimization:{$user->id}";

        return Cache::remember($cacheKey, now()->addHours(3), function () use ($user) {
            return [
                'preferred_content_types' => $this->getPreferredContentTypes($user),
                'optimal_engagement_times' => $this->getOptimalEngagementTimes($user),
                'preferred_authors' => $this->getPreferredAuthors($user),
                'engagement_patterns' => $this->getEngagementPatterns($user),
                'content_diversity_preference' => $this->getContentDiversityPreference($user),
            ];
        });
    }

    public function recordBulkEngagement(array $engagements): void
    {
        try {
            DB::table('user_engagement_tracking')->insert($engagements);
        } catch (Exception $e) {
            Log::error('Failed to record bulk engagement data', [
                'error' => $e->getMessage(),
                'engagements_count' => count($engagements),
            ]);
        }
    }

    private function recordEngagement(User $user, string $type, array $data = []): void
    {
        try {
            // Store in database for historical analysis
            DB::table('user_engagement_tracking')->insert([
                'user_id' => $user->id,
                'type' => $type,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update real-time cache
            $this->updateRealtimeEngagement($user, $type, $data);

        } catch (Exception $e) {
            Log::error('Failed to record engagement', [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function updateRealtimeEngagement(User $user, string $type, array $data): void
    {
        $cacheKey = "user_session:{$user->id}";
        $sessionData = Cache::get($cacheKey, [
            'start_time' => now(),
            'posts_viewed' => [],
            'interactions_count' => 0,
        ]);

        if (in_array($type, ['post_like', 'post_comment', 'post_share'])) {
            $sessionData['interactions_count']++;
        }

        if ($type === 'post_view' && isset($data['post_id'])) {
            $sessionData['posts_viewed'][] = $data['post_id'];
            $sessionData['posts_viewed'] = array_unique($sessionData['posts_viewed']);
        }

        Cache::put($cacheKey, $sessionData, now()->addHours(2));
    }

    private function updateEngagementMetrics(User $user, SocialPost $post, string $interactionType): void
    {
        // Update post engagement counters in cache for real-time feed ranking
        $postMetricsKey = "post_metrics:{$post->id}";
        $metrics = Cache::get($postMetricsKey, [
            'views' => 0,
            'likes' => 0,
            'comments' => 0,
            'shares' => 0,
        ]);

        if ($interactionType === 'post_like') {
            $metrics['likes']++;
        } elseif ($interactionType === 'post_comment') {
            $metrics['comments']++;
        } elseif ($interactionType === 'post_share') {
            $metrics['shares']++;
        }

        Cache::put($postMetricsKey, $metrics, now()->addHours(6));

        // Track user-author interaction for social scoring
        $this->trackUserAuthorInteraction($user, $post->user_id);
    }

    private function trackUserAuthorInteraction(User $user, string $authorId): void
    {
        $interactionKey = "user_author_interaction:{$user->id}:{$authorId}";
        $count = Cache::get($interactionKey, 0);
        Cache::put($interactionKey, $count + 1, now()->addDays(30));
    }

    private function getRecentEngagements(User $user, int $days): \Illuminate\Support\Collection
    {
        return DB::table('user_engagement_tracking')
            ->where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays($days))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    private function getDailyActiveDays(User $user, int $days): int
    {
        return DB::table('user_engagement_tracking')
            ->where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('DATE(created_at) as date')
            ->distinct()
            ->count();
    }

    private function getWeeklyActiveWeeks(User $user, int $weeks): int
    {
        return DB::table('user_engagement_tracking')
            ->where('user_id', $user->id)
            ->where('created_at', '>=', now()->subWeeks($weeks))
            ->selectRaw('WEEK(created_at) as week')
            ->distinct()
            ->count();
    }

    private function getAverageSessionDuration(User $user): float
    {
        $sessions = DB::table('user_engagement_tracking')
            ->where('user_id', $user->id)
            ->where('type', 'session_end')
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        if ($sessions->isEmpty()) {
            return 0;
        }

        $totalDuration = $sessions->sum(function ($session) {
            $data = json_decode($session->data, true);

            return $data['duration'] ?? 0;
        });

        return $totalDuration / $sessions->count();
    }

    private function getAveragePostsPerSession(User $user): float
    {
        $sessions = DB::table('user_engagement_tracking')
            ->where('user_id', $user->id)
            ->where('type', 'session_end')
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        if ($sessions->isEmpty()) {
            return 0;
        }

        $totalPosts = $sessions->sum(function ($session) {
            $data = json_decode($session->data, true);

            return $data['posts_viewed'] ?? 0;
        });

        return $totalPosts / $sessions->count();
    }

    private function getEngagementTrend(User $user): string
    {
        $thisWeek = $this->getEngagementScore($user, 7);
        $lastWeek = $this->getEngagementScore($user, 14) - $thisWeek;

        if ($lastWeek === 0) {
            return 'stable';
        }

        $change = ($thisWeek - $lastWeek) / $lastWeek;

        if ($change > 0.1) {
            return 'increasing';
        }
        if ($change < -0.1) {
            return 'decreasing';
        }

        return 'stable';
    }

    private function calculateRetentionRisk(User $user): string
    {
        $lastActive = $user->last_active_at;

        if (! $lastActive) {
            return 'high';
        }

        $daysSinceActive = now()->diffInDays($lastActive);
        $engagementScore = $this->getEngagementScore($user, 7);

        if ($daysSinceActive > 7 || $engagementScore < 5) {
            return 'high';
        }
        if ($daysSinceActive > 3 || $engagementScore < 15) {
            return 'medium';
        }

        return 'low';
    }

    private function getPreferredContentTypes(User $user): array
    {
        $engagements = DB::table('user_engagement_tracking')
            ->where('user_id', $user->id)
            ->whereIn('type', ['post_like', 'post_comment', 'post_share'])
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        $contentTypes = [];
        foreach ($engagements as $engagement) {
            $data = json_decode($engagement->data, true);
            if (isset($data['content_type'])) {
                $contentTypes[] = $data['content_type'];
            }
        }

        return array_count_values($contentTypes);
    }

    private function getOptimalEngagementTimes(User $user): array
    {
        return DB::table('user_engagement_tracking')
            ->where('user_id', $user->id)
            ->whereIn('type', ['post_like', 'post_comment', 'post_share'])
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderByDesc('count')
            ->limit(6)
            ->pluck('hour')
            ->toArray();
    }

    private function getPreferredAuthors(User $user): array
    {
        return DB::table('user_engagement_tracking')
            ->where('user_id', $user->id)
            ->whereIn('type', ['post_like', 'post_comment', 'post_share'])
            ->where('created_at', '>=', now()->subDays(30))
            ->get()
            ->map(function ($engagement) {
                $data = json_decode($engagement->data, true);

                return $data['post_author_id'] ?? null;
            })
            ->filter()
            ->countBy()
            ->sortDesc()
            ->take(20)
            ->keys()
            ->toArray();
    }

    private function getEngagementPatterns(User $user): array
    {
        $engagements = $this->getRecentEngagements($user, 30);

        return [
            'most_active_day' => $this->getMostActiveDay($engagements),
            'engagement_consistency' => $this->getEngagementConsistency($engagements),
            'preferred_interaction_type' => $this->getPreferredInteractionType($engagements),
        ];
    }

    private function getMostActiveDay(\Illuminate\Support\Collection $engagements): string
    {
        $days = $engagements->groupBy(function ($engagement) {
            return \Carbon\Carbon::parse($engagement->created_at)->format('N');
        })->map->count()->sortDesc();

        $dayMap = [
            '1' => 'Monday',
            '2' => 'Tuesday',
            '3' => 'Wednesday',
            '4' => 'Thursday',
            '5' => 'Friday',
            '6' => 'Saturday',
            '7' => 'Sunday',
        ];

        return $dayMap[$days->keys()->first()] ?? 'Unknown';
    }

    private function getEngagementConsistency(

        \Support\Collection $engagements): string
    {
        $dailyCounts = $engagements->groupBy(function ($engagement) {
            return \Carbon\Carbon::parse($engagement->created_at)->format('Y-m-d');
        })->map->count();

        if ($dailyCounts->count() < 7) {
            return 'low';
        }

        $variance = $this->calculateVariance($dailyCounts->values()->toArray());
        $mean = $dailyCounts->avg();

        $coefficient = $mean > 0 ? sqrt($variance) / $mean : 0;

        if ($coefficient < 0.5) {
            return 'high';
        }
        if ($coefficient < 1.0) {
            return 'medium';
        }

        return 'low';
    }

    private function getPreferredInteractionType(\Illuminate\Support\Collection $engagements): string
    {
        $types = $engagements->countBy('type')->sortDesc();

        return $types->keys()->first() ?? 'post_view';
    }

    private function getContentDiversityPreference(User $user): float
    {
        // Calculate how much the user prefers content diversity vs. similar content
        $contentTypes = $this->getPreferredContentTypes($user);

        if (empty($contentTypes)) {
            return 0.5; // neutral preference
        }

        $total = array_sum($contentTypes);
        $entropy = 0;

        foreach ($contentTypes as $count) {
            $probability = $count / $total;
            $entropy -= $probability * log($probability, 2);
        }

        // Normalize entropy to 0-1 scale (higher = more diverse)
        $maxEntropy = log(count($contentTypes), 2);

        return $maxEntropy > 0 ? $entropy / $maxEntropy : 0;
    }

    private function calculateVariance(array $values): float
    {
        $mean = array_sum($values) / count($values);
        $variance = 0;

        foreach ($values as $value) {
            $variance += pow($value - $mean, 2);
        }

        return $variance / count($values);
    }

    private function determineContentType(SocialPost $post): string
    {
        if ($post->media) {
            return 'media';
        }

        if ($post->location) {
            return 'location';
        }

        if (mb_strlen($post->content) > 200) {
            return 'long_text';
        }

        return 'short_text';
    }
}
