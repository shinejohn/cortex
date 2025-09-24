<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SocialPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

final class SocialFeedAlgorithmService
{
    private const ENGAGEMENT_WEIGHTS = [
        'like' => 1.0,
        'comment' => 2.0,
        'share' => 3.0,
        'click' => 0.5,
        'time_spent' => 0.1, // per second
    ];

    private const RECENCY_DECAY_HOURS = 24;

    private const MAX_POSTS_PER_USER = 3;

    private const DIVERSITY_THRESHOLD = 0.3;

    public function getForYouFeed(User $user, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        $cacheKey = "for_you_feed:{$user->id}:page:{$page}";

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($user, $page, $perPage) {
            $posts = $this->buildForYouQuery($user)
                ->with(['user', 'likes', 'comments', 'shares'])
                ->get();

            // If no algorithm data or insufficient posts, fallback to latest
            if ($posts->isEmpty() || ! $this->hasUserEngagementData($user)) {
                return $this->getFallbackFeed($user, $page, $perPage);
            }

            $scoredPosts = $this->scoreAndRankPosts($posts, $user);
            $diversifiedPosts = $this->diversifyFeed($scoredPosts, $user);

            return $this->paginateResults($diversifiedPosts, $page, $perPage);
        });
    }

    public function getFollowedFeed(User $user, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        $followedUserIds = $user->following()->pluck('following_id');
        $friendIds = $user->acceptedFriends()->pluck('friend_id');
        $allFollowedIds = $followedUserIds->merge($friendIds)->unique();

        if ($allFollowedIds->isEmpty()) {
            // If user doesn't follow anyone, show them some public posts to encourage engagement
            return $this->getFallbackFeed($user, $page, $perPage);
        }

        $posts = SocialPost::whereIn('user_id', $allFollowedIds)
            ->where('visibility', '!=', 'private')
            ->where('is_active', true)
            ->with(['user', 'likes', 'comments', 'shares'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Apply light engagement scoring for followed feed
        $rankedPosts = $this->applyLightEngagementRanking($posts);

        return $this->paginateResults($rankedPosts, $page, $perPage);
    }

    public function getFallbackFeed(User $user, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        // Simple fallback: latest posts sorted by creation date
        $posts = SocialPost::query()
            ->where('is_active', true)
            ->where('visibility', 'public')
            ->where('user_id', '!=', $user->id)
            ->with(['user', 'likes', 'comments', 'shares'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Convert to LengthAwarePaginator format expected by frontend
        return new LengthAwarePaginator(
            $posts->items(),
            $posts->total(),
            $posts->perPage(),
            $posts->currentPage(),
            [
                'path' => request()->url(),
                'pageName' => 'page',
            ]
        );
    }

    private function hasUserEngagementData(User $user): bool
    {
        // For now, always use fallback to ensure users see posts
        // In production, you might want to check:
        // - User has been active for at least a few days
        // - User has sufficient engagement data

        // Check if user has any engagement data at all
        return DB::table('user_engagement_tracking')
            ->where('user_id', $user->id)
            ->exists() && DB::table('user_engagement_tracking')
            ->where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->count() >= 10; // Require at least 10 engagement events in last month
    }

    private function buildForYouQuery(User $user): Builder
    {
        $followedUserIds = $user->following()->pluck('following_id');
        $friendIds = $user->acceptedFriends()->pluck('friend_id');
        $blockedUserIds = $user->blockedUsers()->pluck('blocked_user_id');

        // Get posts from last 7 days for better performance
        $cutoffDate = now()->subDays(7);

        return SocialPost::query()
            ->where('is_active', true)
            ->where('created_at', '>=', $cutoffDate)
            ->where('user_id', '!=', $user->id)
            ->when($blockedUserIds->isNotEmpty(), fn ($query) => $query->whereNotIn('user_id', $blockedUserIds)
            )
            ->where(function ($query) use ($friendIds) {
                // Include public posts
                $query->where('visibility', 'public')
                    // Include friends-only posts from friends
                    ->orWhere(function ($subQuery) use ($friendIds) {
                        $subQuery->where('visibility', 'friends')
                            ->whereIn('user_id', $friendIds);
                    });
            });
    }

    private function scoreAndRankPosts(Collection $posts, User $user): Collection
    {
        $userInterests = $this->getUserInterests($user);
        $userBehaviorProfile = $this->getUserBehaviorProfile($user);

        return $posts->map(function (SocialPost $post) use ($user, $userInterests, $userBehaviorProfile) {
            $score = $this->calculatePostScore($post, $user, $userInterests, $userBehaviorProfile);
            $post->algorithm_score = $score;

            return $post;
        })->sortByDesc('algorithm_score');
    }

    private function calculatePostScore(SocialPost $post, User $user, array $userInterests, array $userBehaviorProfile): float
    {
        $score = 0.0;

        // 1. Engagement Score (40% weight)
        $engagementScore = $this->calculateEngagementScore($post);
        $score += $engagementScore * 0.4;

        // 2. Recency Score (25% weight)
        $recencyScore = $this->calculateRecencyScore($post);
        $score += $recencyScore * 0.25;

        // 3. Social Connection Score (20% weight)
        $socialScore = $this->calculateSocialConnectionScore($post, $user);
        $score += $socialScore * 0.2;

        // 4. Content Relevance Score (15% weight)
        $relevanceScore = $this->calculateContentRelevanceScore($post, $userInterests, $userBehaviorProfile);
        $score += $relevanceScore * 0.15;

        // Apply penalties
        $score = $this->applyPenalties($score, $post, $user);

        return max(0, $score);
    }

    private function calculateEngagementScore(SocialPost $post): float
    {
        $likesCount = $post->likes->count();
        $commentsCount = $post->comments->count();
        $sharesCount = $post->shares->count();

        // Calculate engagement rate
        $totalEngagements = ($likesCount * self::ENGAGEMENT_WEIGHTS['like']) +
                          ($commentsCount * self::ENGAGEMENT_WEIGHTS['comment']) +
                          ($sharesCount * self::ENGAGEMENT_WEIGHTS['share']);

        // Normalize by post age (hours)
        $hoursOld = $post->created_at->diffInHours(now()) + 1;
        $engagementRate = $totalEngagements / $hoursOld;

        // Apply logarithmic scaling to prevent viral posts from dominating
        return log10($engagementRate + 1) * 10;
    }

    private function calculateRecencyScore(SocialPost $post): float
    {
        $hoursOld = $post->created_at->diffInHours(now());

        // Exponential decay: newer posts get higher scores
        return exp(-$hoursOld / self::RECENCY_DECAY_HOURS) * 100;
    }

    private function calculateSocialConnectionScore(SocialPost $post, User $user): float
    {
        $score = 0.0;

        // Check if user follows the post author
        if ($user->following()->where('following_id', $post->user_id)->exists()) {
            $score += 30;
        }

        // Check if user is friends with the post author
        if ($user->acceptedFriends()->where('friend_id', $post->user_id)->exists()) {
            $score += 50;
        }

        // Check mutual connections
        $mutualFriendsCount = $this->getMutualFriendsCount($user, $post->user_id);
        $score += min($mutualFriendsCount * 5, 20); // Cap at 20 points

        // Check if user has engaged with this author before
        $hasEngaged = $this->hasUserEngagedWithAuthor($user, $post->user_id);
        if ($hasEngaged) {
            $score += 15;
        }

        return $score;
    }

    private function calculateContentRelevanceScore(SocialPost $post, array $userInterests, array $userBehaviorProfile): float
    {
        $score = 0.0;

        // Content similarity based on user's past interactions
        if (isset($userBehaviorProfile['preferred_content_types'])) {
            $contentType = $this->determineContentType($post);
            if (in_array($contentType, $userBehaviorProfile['preferred_content_types'])) {
                $score += 20;
            }
        }

        // Location relevance
        if ($post->location && $userBehaviorProfile['preferred_locations'] ?? null) {
            if ($this->isLocationRelevant($post->location, $userBehaviorProfile['preferred_locations'])) {
                $score += 15;
            }
        }

        // Time-based patterns (post at times user is usually active)
        if ($this->isPostedAtOptimalTime($post, $userBehaviorProfile)) {
            $score += 10;
        }

        return $score;
    }

    private function applyPenalties(float $score, SocialPost $post, User $user): float
    {
        // Penalty for posts user has already seen
        if ($this->hasUserSeenPost($user, $post)) {
            $score *= 0.1;
        }

        // Penalty for over-representation from same user
        $recentPostsFromSameUser = $this->getRecentPostsCountFromUser($post->user_id, 24);
        if ($recentPostsFromSameUser > self::MAX_POSTS_PER_USER) {
            $score *= 0.5;
        }

        // Penalty for low-quality indicators
        if ($this->isLowQualityPost($post)) {
            $score *= 0.3;
        }

        return $score;
    }

    private function diversifyFeed(Collection $posts, User $user): Collection
    {
        $diversifiedPosts = collect();
        $authorCounts = collect();
        $contentTypeCounts = collect();

        foreach ($posts as $post) {
            $authorId = $post->user_id;
            $contentType = $this->determineContentType($post);

            // Check diversity constraints
            if ($this->shouldIncludePostForDiversity($post, $authorCounts, $contentTypeCounts)) {
                $diversifiedPosts->push($post);
                $authorCounts[$authorId] = ($authorCounts[$authorId] ?? 0) + 1;
                $contentTypeCounts[$contentType] = ($contentTypeCounts[$contentType] ?? 0) + 1;
            }

            // Stop if we have enough posts for several pages
            if ($diversifiedPosts->count() >= 100) {
                break;
            }
        }

        return $diversifiedPosts;
    }

    private function shouldIncludePostForDiversity(SocialPost $post, Collection $authorCounts, Collection $contentTypeCounts): bool
    {
        $authorId = $post->user_id;
        $contentType = $this->determineContentType($post);

        // Limit posts per author
        if (($authorCounts[$authorId] ?? 0) >= self::MAX_POSTS_PER_USER) {
            return false;
        }

        // Ensure content type diversity
        $totalPosts = $authorCounts->sum();
        if ($totalPosts > 10) {
            $contentTypeRatio = ($contentTypeCounts[$contentType] ?? 0) / $totalPosts;
            if ($contentTypeRatio > self::DIVERSITY_THRESHOLD) {
                return false;
            }
        }

        return true;
    }

    private function applyLightEngagementRanking(Collection $posts): Collection
    {
        return $posts->map(function (SocialPost $post) {
            $engagementScore = $this->calculateEngagementScore($post);
            $recencyScore = $this->calculateRecencyScore($post);
            $post->algorithm_score = ($engagementScore * 0.3) + ($recencyScore * 0.7);

            return $post;
        })->sortByDesc('algorithm_score');
    }

    private function getUserInterests(User $user): array
    {
        // Get user interests from profile or infer from behavior
        return Cache::remember("user_interests:{$user->id}", now()->addHours(24), function () use ($user) {
            $interests = [];

            // From user profile
            if ($user->socialProfile && $user->socialProfile->interests) {
                $interests = array_merge($interests, $user->socialProfile->interests);
            }

            // Infer from engagement history
            $inferredInterests = $this->inferInterestsFromBehavior($user);
            $interests = array_merge($interests, $inferredInterests);

            return array_unique($interests);
        });
    }

    private function getUserBehaviorProfile(User $user): array
    {
        return Cache::remember("user_behavior:{$user->id}", now()->addHours(6), function () use ($user) {
            return [
                'preferred_content_types' => $this->getPreferredContentTypes($user),
                'optimal_posting_times' => $this->getOptimalEngagementTimes($user),
                'preferred_locations' => $this->getPreferredLocations($user),
                'engagement_patterns' => $this->getEngagementPatterns($user),
            ];
        });
    }

    private function inferInterestsFromBehavior(User $user): array
    {
        // Analyze user's likes, comments, shares to infer interests
        // This is a simplified version - in production, you'd use more sophisticated ML
        $interests = [];

        $engagedPosts = DB::table('social_post_likes')
            ->join('social_posts', 'social_post_likes.post_id', '=', 'social_posts.id')
            ->where('social_post_likes.user_id', $user->id)
            ->pluck('social_posts.content');

        // Simple keyword extraction (in production, use NLP)
        foreach ($engagedPosts as $content) {
            $keywords = $this->extractKeywords($content);
            $interests = array_merge($interests, $keywords);
        }

        return array_unique($interests);
    }

    private function extractKeywords(string $content): array
    {
        // Simplified keyword extraction
        $words = str_word_count(mb_strtolower($content), 1);
        $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];

        return array_diff($words, $stopWords);
    }

    private function getPreferredContentTypes(User $user): array
    {
        // Analyze what types of content user engages with most
        $contentTypes = DB::table('social_post_likes')
            ->join('social_posts', 'social_post_likes.post_id', '=', 'social_posts.id')
            ->where('social_post_likes.user_id', $user->id)
            ->selectRaw('
                CASE
                    WHEN media IS NOT NULL THEN "media"
                    WHEN location IS NOT NULL THEN "location"
                    ELSE "text"
                END as content_type,
                COUNT(*) as count
            ')
            ->groupBy('content_type')
            ->orderByDesc('count')
            ->pluck('content_type')
            ->toArray();

        return $contentTypes;
    }

    private function getOptimalEngagementTimes(User $user): array
    {
        $engagementTimes = DB::table('social_post_likes')
            ->where('user_id', $user->id)
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderByDesc('count')
            ->limit(6)
            ->pluck('hour')
            ->toArray();

        return $engagementTimes;
    }

    private function getPreferredLocations(User $user): array
    {
        // Get locations user has engaged with or posted from
        return [];
    }

    private function getEngagementPatterns(User $user): array
    {
        return [
            'average_session_length' => $this->getAverageSessionLength($user),
            'preferred_content_length' => $this->getPreferredContentLength($user),
            'engagement_frequency' => $this->getEngagementFrequency($user),
        ];
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

    private function isLocationRelevant(array $postLocation, array $userPreferredLocations): bool
    {
        // Implement location proximity logic
        return false;
    }

    private function isPostedAtOptimalTime(SocialPost $post, array $userBehaviorProfile): bool
    {
        $postHour = $post->created_at->hour;
        $optimalTimes = $userBehaviorProfile['optimal_posting_times'] ?? [];

        return in_array($postHour, $optimalTimes);
    }

    private function hasUserSeenPost(User $user, SocialPost $post): bool
    {
        // Check if user has viewed this post (would need impression tracking)
        return false;
    }

    private function getRecentPostsCountFromUser(string $userId, int $hours): int
    {
        return SocialPost::where('user_id', $userId)
            ->where('created_at', '>=', now()->subHours($hours))
            ->count();
    }

    private function isLowQualityPost(SocialPost $post): bool
    {
        // Check for quality indicators
        $contentLength = mb_strlen(mb_trim($post->content));

        // Too short content
        if ($contentLength < 10) {
            return true;
        }

        // No engagement after significant time
        $hoursOld = $post->created_at->diffInHours(now());
        if ($hoursOld > 6 && $post->likes->count() === 0 && $post->comments->count() === 0) {
            return true;
        }

        return false;
    }

    private function getMutualFriendsCount(User $user, string $otherUserId): int
    {
        $userFriends = $user->acceptedFriends()->pluck('friend_id');
        $otherUserFriends = User::find($otherUserId)?->acceptedFriends()->pluck('friend_id') ?? collect();

        return $userFriends->intersect($otherUserFriends)->count();
    }

    private function hasUserEngagedWithAuthor(User $user, string $authorId): bool
    {
        return DB::table('social_post_likes')
            ->join('social_posts', 'social_post_likes.post_id', '=', 'social_posts.id')
            ->where('social_post_likes.user_id', $user->id)
            ->where('social_posts.user_id', $authorId)
            ->exists();
    }

    private function getAverageSessionLength(User $user): float
    {
        // Would need session tracking
        return 300; // 5 minutes default
    }

    private function getPreferredContentLength(User $user): string
    {
        // Analyze content length user typically engages with
        return 'medium';
    }

    private function getEngagementFrequency(User $user): string
    {
        // Analyze how often user engages
        return 'moderate';
    }

    private function paginateResults(Collection $posts, int $page, int $perPage): LengthAwarePaginator
    {
        $total = $posts->count();
        $items = $posts->forPage($page, $perPage)->values();

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            [
                'path' => request()->url(),
                'pageName' => 'page',
            ]
        );
    }
}
