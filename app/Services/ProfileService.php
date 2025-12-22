<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

final class ProfileService
{
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Get user profile
     */
    public function getProfile(User|string $user): User
    {
        $userId = $user instanceof User ? $user->id : $user;
        $cacheKey = "profile:{$userId}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($userId) {
            return User::with([
                'workspaces',
                'currentWorkspace',
                'socialAccounts',
            ])->findOrFail($userId);
        });
    }

    /**
     * Update user profile
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->update($data);

        // Clear cache
        $this->clearProfileCache($user);

        return $user->fresh();
    }

    /**
     * Get user statistics
     */
    public function getStats(User $user): array
    {
        $cacheKey = "profile:stats:{$user->id}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () use ($user) {
            return [
                'reviews_count' => $this->getReviewsCount($user),
                'ratings_count' => $this->getRatingsCount($user),
                'articles_count' => $this->getArticlesCount($user),
                'events_count' => $this->getEventsCount($user),
                'coupons_count' => $this->getCouponsCount($user),
                'followers_count' => $this->getFollowersCount($user),
                'following_count' => $this->getFollowingCount($user),
                'total_points' => $user->total_points ?? 0,
                'level' => $user->level ?? 1,
                'achievements_count' => $this->getAchievementsCount($user),
            ];
        });
    }

    /**
     * Get user activity feed
     */
    public function getActivity(User $user, int $limit = 20): Collection
    {
        $cacheKey = "profile:activity:{$user->id}:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () use ($user, $limit) {
            // This would typically query a social_activities table
            // For now, return empty collection - implement when activity tracking is available
            return collect([]);
        });
    }

    /**
     * Get user reviews count
     */
    private function getReviewsCount(User $user): int
    {
        return \App\Models\Review::where('user_id', $user->id)
            ->where('status', 'approved')
            ->count();
    }

    /**
     * Get user ratings count
     */
    private function getRatingsCount(User $user): int
    {
        return \App\Models\Rating::where('user_id', $user->id)->count();
    }

    /**
     * Get user articles count
     */
    private function getArticlesCount(User $user): int
    {
        return \App\Models\DayNewsPost::where('author_id', $user->id)
            ->where('status', 'published')
            ->count();
    }

    /**
     * Get user events count
     */
    private function getEventsCount(User $user): int
    {
        return \App\Models\Event::where('created_by', $user->id)
            ->where('status', 'published')
            ->count();
    }

    /**
     * Get user coupons count
     */
    private function getCouponsCount(User $user): int
    {
        return \App\Models\Coupon::where('user_id', $user->id)
            ->where('status', 'active')
            ->count();
    }

    /**
     * Get user followers count
     */
    private function getFollowersCount(User $user): int
    {
        return \App\Models\Follow::where('followable_type', User::class)
            ->where('followable_id', $user->id)
            ->count();
    }

    /**
     * Get user following count
     */
    private function getFollowingCount(User $user): int
    {
        return \App\Models\Follow::where('user_id', $user->id)->count();
    }

    /**
     * Get user achievements count
     */
    private function getAchievementsCount(User $user): int
    {
        // This would query an achievements table when it exists
        return 0;
    }

    /**
     * Clear profile-related cache
     */
    private function clearProfileCache(User $user): void
    {
        $this->cacheService->forget("profile:{$user->id}");
        $this->cacheService->forget("profile:stats:{$user->id}");
        $this->cacheService->forget("profile:activity:{$user->id}:*");
    }
}

