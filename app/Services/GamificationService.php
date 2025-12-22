<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class GamificationService
{
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Award points to a user
     */
    public function awardPoints(User $user, int $points, string $reason, ?string $sourceType = null, ?string $sourceId = null): void
    {
        DB::beginTransaction();
        
        try {
            // Update user points
            $user->increment('total_points', $points);

            // Calculate new level
            $newLevel = $this->calculateLevel($user->total_points);
            if ($newLevel > ($user->level ?? 1)) {
                $user->update(['level' => $newLevel]);
            }

            // Log points transaction (would need PointsTransaction model)
            // PointsTransaction::create([
            //     'user_id' => $user->id,
            //     'points' => $points,
            //     'reason' => $reason,
            //     'source_type' => $sourceType,
            //     'source_id' => $sourceId,
            // ]);

            DB::commit();

            // Clear cache
            $this->clearUserCache($user);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Unlock an achievement for a user
     */
    public function unlockAchievement(User $user, string $achievementKey, array $metadata = []): void
    {
        DB::beginTransaction();
        
        try {
            // Check if achievement already unlocked (would need UserAchievement model)
            // $exists = UserAchievement::where('user_id', $user->id)
            //     ->where('achievement_key', $achievementKey)
            //     ->exists();
            //
            // if ($exists) {
            //     return;
            // }

            // Unlock achievement
            // UserAchievement::create([
            //     'user_id' => $user->id,
            //     'achievement_key' => $achievementKey,
            //     'unlocked_at' => now(),
            //     'metadata' => $metadata,
            // ]);

            // Award points for achievement (if configured)
            // $achievement = Achievement::where('key', $achievementKey)->first();
            // if ($achievement && $achievement->points > 0) {
            //     $this->awardPoints($user, $achievement->points, "Achievement: {$achievement->name}", 'achievement', $achievement->id);
            // }

            DB::commit();

            // Clear cache
            $this->clearUserCache($user);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get user level
     */
    public function getUserLevel(User $user): int
    {
        return $this->calculateLevel($user->total_points ?? 0);
    }

    /**
     * Calculate level from points
     */
    private function calculateLevel(int $points): int
    {
        // Level calculation: 100 points per level (can be customized)
        return max(1, (int) floor($points / 100) + 1);
    }

    /**
     * Get user achievements
     */
    public function getUserAchievements(User $user): Collection
    {
        $cacheKey = "user:achievements:{$user->id}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($user) {
            // Would query UserAchievement model
            // return UserAchievement::where('user_id', $user->id)
            //     ->with('achievement')
            //     ->orderBy('unlocked_at', 'desc')
            //     ->get();
            
            return collect([]);
        });
    }

    /**
     * Get leaderboard
     */
    public function getLeaderboard(string $type = 'points', string $period = 'all_time', int $limit = 100): Collection
    {
        $cacheKey = "leaderboard:{$type}:{$period}:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () use ($type, $period, $limit) {
            $query = User::query();

            // Apply period filter if needed (for future implementation)
            // if ($period !== 'all_time') {
            //     $dateFilter = match ($period) {
            //         'daily' => now()->subDay(),
            //         'weekly' => now()->subWeek(),
            //         'monthly' => now()->subMonth(),
            //         default => null,
            //     };
            //     if ($dateFilter) {
            //         // Would filter by activity date
            //     }
            // }

            match ($type) {
                'points' => $query->orderBy('total_points', 'desc'),
                'level' => $query->orderBy('level', 'desc'),
                'achievements' => $query->orderBy('achievements_count', 'desc'),
                'reviews' => $query->withCount('reviews')->orderBy('reviews_count', 'desc'),
                'visits' => $query->orderBy('total_points', 'desc'), // Placeholder
                'referrals' => $query->orderBy('total_points', 'desc'), // Placeholder
                default => $query->orderBy('total_points', 'desc'),
            };

            return $query->limit($limit)->get();
        });
    }

    /**
     * Get all achievements
     */
    public function getAchievements(array $filters = []): Collection
    {
        $cacheKey = 'achievements:'.md5(serialize($filters));
        
        return $this->cacheService->remember($cacheKey, now()->addHours(1), function () use ($filters) {
            // Would query Achievement model
            // $query = Achievement::where('is_active', true);
            //
            // if (isset($filters['category'])) {
            //     $query->where('category', $filters['category']);
            // }
            //
            // if (isset($filters['rarity'])) {
            //     $query->where('rarity', $filters['rarity']);
            // }
            //
            // return $query->orderBy('points', 'desc')->get();
            
            return collect([]);
        });
    }

    /**
     * Get user rank
     */
    public function getUserRank(User $user, string $type = 'points'): int
    {
        $cacheKey = "user:rank:{$user->id}:{$type}";
        
        return (int) $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () use ($user, $type) {
            $query = User::query();

            match ($type) {
                'points' => $query->where('total_points', '>', $user->total_points ?? 0),
                'level' => $query->where('level', '>', $user->level ?? 1),
                default => $query->where('total_points', '>', $user->total_points ?? 0),
            };

            return $query->count() + 1;
        });
    }

    /**
     * Check if user can unlock achievement
     */
    public function checkAchievementProgress(User $user, string $achievementKey): array
    {
        // Would check achievement requirements
        // $achievement = Achievement::where('key', $achievementKey)->first();
        // if (!$achievement) {
        //     return ['unlocked' => false, 'progress' => 0, 'required' => 0];
        // }
        //
        // $progress = $this->calculateAchievementProgress($user, $achievement);
        // $unlocked = $progress >= $achievement->required_value;
        //
        // return [
        //     'unlocked' => $unlocked,
        //     'progress' => $progress,
        //     'required' => $achievement->required_value,
        //     'percentage' => min(100, ($progress / $achievement->required_value) * 100),
        // ];

        return ['unlocked' => false, 'progress' => 0, 'required' => 0, 'percentage' => 0];
    }

    /**
     * Clear user-related cache
     */
    private function clearUserCache(User $user): void
    {
        $this->cacheService->forget("user:achievements:{$user->id}");
        $this->cacheService->forget("user:rank:{$user->id}:*");
        $this->cacheService->forget('leaderboard:*');
    }
}

