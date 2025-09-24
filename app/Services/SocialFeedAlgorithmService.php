<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SocialPost;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class SocialFeedAlgorithmService
{
    private const LIKE_WEIGHT = 1.0;

    private const COMMENT_WEIGHT = 2.0;

    private const RECENT_ENGAGEMENT_HOURS = 12; // Boost for recent engagement

    private const POST_AGE_DECAY_HOURS = 48; // How quickly post score decays

    private const NEW_POST_BOOST_HOURS = 6; // Give new posts a boost for their first 6 hours

    private const NEW_POST_BOOST_SCORE = 10; // Base score boost for new posts

    public function getForYouFeed(User $user, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        $posts = $this->buildForYouQuery($user)
            ->with(['user'])
            ->get();

        if ($posts->isEmpty()) {
            return $this->getFallbackFeed($user, $page, $perPage);
        }

        $rankedPosts = $this->scorePostsSimply($posts);

        return $this->paginateResults($rankedPosts, $page, $perPage);
    }

    public function getFollowedFeed(User $user, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        $followedUserIds = $user->following()->pluck('following_id');
        $friendIds = $user->acceptedFriends()->pluck('friend_id');
        $allFollowedIds = $followedUserIds->merge($friendIds)->unique();

        if ($allFollowedIds->isEmpty()) {
            return $this->getFallbackFeed($user, $page, $perPage);
        }

        $posts = SocialPost::whereIn('user_id', $allFollowedIds)
            ->where('visibility', '!=', 'private')
            ->where('is_active', true)
            ->where('created_at', '>=', now()->subDays(7)) // Only show recent posts
            ->with(['user'])
            ->get();

        $rankedPosts = $this->scorePostsSimply($posts);

        return $this->paginateResults($rankedPosts, $page, $perPage);
    }

    public function getFallbackFeed(User $user, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        $posts = SocialPost::query()
            ->where('is_active', true)
            ->where('visibility', 'public')
            ->where('user_id', '!=', $user->id)
            ->where('created_at', '>=', now()->subDays(7))
            ->with(['user'])
            ->get();

        $rankedPosts = $this->scorePostsSimply($posts);

        return $this->paginateResults($rankedPosts, $page, $perPage);
    }

    private function scorePostsSimply(Collection $posts): Collection
    {
        return $posts->map(function (SocialPost $post) {
            $score = $this->calculateSimpleScore($post);
            $post->algorithm_score = $score;

            return $post;
        })->sortByDesc('algorithm_score')->values();
    }

    private function calculateSimpleScore(SocialPost $post): float
    {
        $now = now();
        $postAge = $post->created_at->diffInHours($now);

        // Get like and comment counts with timestamps
        $likes = DB::table('social_post_likes')
            ->where('post_id', $post->id)
            ->select('created_at')
            ->get();

        $comments = DB::table('social_post_comments')
            ->where('post_id', $post->id)
            ->where('is_active', true)
            ->select('created_at')
            ->get();

        // Calculate engagement score with time-based weighting
        $engagementScore = 0;

        // Score likes - more recent likes get higher weight
        foreach ($likes as $like) {
            $likeAge = $now->diffInHours(Carbon::parse($like->created_at));
            $timeWeight = $likeAge <= self::RECENT_ENGAGEMENT_HOURS ? 2.0 : 1.0;
            $engagementScore += self::LIKE_WEIGHT * $timeWeight;
        }

        // Score comments - they get higher base weight and time bonus
        foreach ($comments as $comment) {
            $commentAge = $now->diffInHours(Carbon::parse($comment->created_at));
            $timeWeight = $commentAge <= self::RECENT_ENGAGEMENT_HOURS ? 2.0 : 1.0;
            $engagementScore += self::COMMENT_WEIGHT * $timeWeight;
        }

        // Apply post age decay - newer posts get a boost
        $ageDecay = max(0.1, 1 - ($postAge / self::POST_AGE_DECAY_HOURS));

        // Give new posts a boost to prevent them getting lost without engagement
        $newPostBoost = $postAge <= self::NEW_POST_BOOST_HOURS
            ? self::NEW_POST_BOOST_SCORE * (1 - ($postAge / self::NEW_POST_BOOST_HOURS))
            : 0;

        $finalScore = ($engagementScore * $ageDecay) + $newPostBoost;

        return $finalScore;
    }

    private function buildForYouQuery(User $user): Builder
    {
        $friendIds = $user->acceptedFriends()->pluck('friend_id');

        return SocialPost::query()
            ->where('is_active', true)
            ->where('created_at', '>=', now()->subDays(7))
            ->where('user_id', '!=', $user->id)
            ->where(function ($query) use ($friendIds) {
                $query->where('visibility', 'public')
                    ->orWhere(function ($subQuery) use ($friendIds) {
                        $subQuery->where('visibility', 'friends')
                            ->whereIn('user_id', $friendIds);
                    });
            });
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
