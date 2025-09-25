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
            ->with(['user.socialProfile', 'likes.user', 'comments.user'])
            ->get()
            ->map(function ($post) use ($user) {
                return $this->enrichPostData($post, $user);
            });

        if ($posts->isEmpty()) {
            return $this->getFallbackFeed($user, $page, $perPage);
        }

        $rankedPosts = $this->scorePostsWithUserBoost($posts, $user);

        return $this->paginateResults($rankedPosts, $page, $perPage);
    }

    public function getFollowedFeed(User $user, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        $friendIds = $user->acceptedFriends()->pluck('friend_id')
            ->merge($user->friendshipRequests()->where('status', 'accepted')->pluck('user_id'))
            ->unique();

        // Include user's own posts alongside friends' posts
        $userIds = $friendIds->push($user->id);

        $posts = SocialPost::whereIn('user_id', $userIds)
            ->where('is_active', true)
            ->where('created_at', '>=', now()->subDays(7))
            ->where(function ($query) use ($user) {
                $query->where('visibility', 'public')
                    ->orWhere('visibility', 'friends')
                    ->orWhere('user_id', $user->id); // Always show user's own posts
            })
            ->with(['user.socialProfile', 'likes.user', 'comments.user'])
            ->get()
            ->map(function ($post) use ($user) {
                return $this->enrichPostData($post, $user);
            });

        if ($posts->isEmpty()) {
            return $this->getEmptyFeed($page, $perPage);
        }

        $rankedPosts = $this->scorePostsWithUserBoost($posts, $user);

        return $this->paginateResults($rankedPosts, $page, $perPage);
    }

    public function getFallbackFeed(User $user, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        $posts = SocialPost::query()
            ->where('is_active', true)
            ->where('visibility', 'public')
            ->where('user_id', '!=', $user->id)
            ->where('created_at', '>=', now()->subDays(7))
            ->where(function ($profileQuery) {
                $profileQuery->whereDoesntHave('user.socialProfile')
                    ->orWhereHas('user.socialProfile', function ($socialProfileQuery) {
                        $socialProfileQuery->where('profile_visibility', '!=', 'private');
                    });
            })
            ->with(['user.socialProfile', 'likes.user', 'comments.user'])
            ->get()
            ->map(function ($post) use ($user) {
                return $this->enrichPostData($post, $user);
            });

        $rankedPosts = $this->scorePostsSimply($posts);

        return $this->paginateResults($rankedPosts, $page, $perPage);
    }

    private function scorePostsSimply(Collection $posts): Collection
    {
        return $posts->map(function ($post) {
            $postModel = is_array($post) ? SocialPost::find($post['id']) : $post;
            $score = $this->calculateSimpleScore($postModel);

            if (is_array($post)) {
                $post['algorithm_score'] = $score;

                return $post;
            }
            $postArray = $post->toArray();
            $postArray['algorithm_score'] = $score;

            return $postArray;

        })->sortByDesc('algorithm_score')->values();
    }

    private function scorePostsWithUserBoost(Collection $posts, User $user): Collection
    {
        return $posts->map(function ($post) use ($user) {
            $postModel = is_array($post) ? SocialPost::find($post['id']) : $post;
            $score = $this->calculateSimpleScore($postModel);

            // Give user's own posts a boost to prioritize them
            if ($postModel->user_id === $user->id) {
                $score *= 1.5; // 50% boost for user's own posts
            }

            if (is_array($post)) {
                $post['algorithm_score'] = $score;

                return $post;
            }
            $postArray = $post->toArray();
            $postArray['algorithm_score'] = $score;

            return $postArray;

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
        $friendIds = $user->acceptedFriends()->pluck('friend_id')
            ->merge($user->friendshipRequests()->where('status', 'accepted')->pluck('user_id'))
            ->unique();

        return SocialPost::query()
            ->where('is_active', true)
            ->where('created_at', '>=', now()->subDays(7))
            ->where(function ($query) use ($friendIds, $user) {
                // Show user's own posts
                $query->where('user_id', $user->id)
                    // Show public posts from non-private profiles
                    ->orWhere(function ($publicQuery) use ($user) {
                        $publicQuery->where('visibility', 'public')
                            ->where('user_id', '!=', $user->id)
                            ->where(function ($profileQuery) {
                                $profileQuery->whereDoesntHave('user.socialProfile')
                                    ->orWhereHas('user.socialProfile', function ($socialProfileQuery) {
                                        $socialProfileQuery->where('profile_visibility', '!=', 'private');
                                    });
                            });
                    })
                    // Show friends-only posts from actual friends
                    ->orWhere(function ($friendsQuery) use ($friendIds) {
                        $friendsQuery->where('visibility', 'friends')
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

    private function getEmptyFeed(int $page, int $perPage): LengthAwarePaginator
    {
        return new LengthAwarePaginator(
            collect([]),
            0,
            $perPage,
            $page,
            [
                'path' => request()->url(),
                'pageName' => 'page',
            ]
        );
    }

    private function enrichPostData(SocialPost $post, User $user): array
    {
        return array_merge($post->toArray(), [
            'likes_count' => $post->likesCount(),
            'comments_count' => $post->commentsCount(),
            'shares_count' => $post->sharesCount(),
            'is_liked_by_user' => $post->isLikedBy($user),
            'recent_comments' => $post->comments()->with('user')->latest()->limit(3)->get()->toArray(),
        ]);
    }
}
