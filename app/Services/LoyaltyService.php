<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Business;
use App\Models\User;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class LoyaltyService
{
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Enroll user in loyalty program
     */
    public function enroll(User $user, Business|string $business): void
    {
        $businessId = $business instanceof Business ? $business->id : $business;

        DB::beginTransaction();

        try {
            // Check if already enrolled (would need LoyaltyEnrollment model)
            // $exists = LoyaltyEnrollment::where('user_id', $user->id)
            //     ->where('business_id', $businessId)
            //     ->exists();
            //
            // if ($exists) {
            //     return;
            // }

            // Enroll user
            // LoyaltyEnrollment::create([
            //     'user_id' => $user->id,
            //     'business_id' => $businessId,
            //     'enrolled_at' => now(),
            //     'points_balance' => 0,
            // ]);

            DB::commit();

            // Clear cache
            $this->clearUserCache($user, $businessId);
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Earn points for user
     */
    public function earnPoints(User $user, Business|string $business, int $points, string $reason, ?string $sourceType = null, ?string $sourceId = null): void
    {
        $businessId = $business instanceof Business ? $business->id : $business;

        DB::beginTransaction();

        try {
            // Get or create enrollment
            // $enrollment = LoyaltyEnrollment::firstOrCreate([
            //     'user_id' => $user->id,
            //     'business_id' => $businessId,
            // ], [
            //     'enrolled_at' => now(),
            //     'points_balance' => 0,
            // ]);

            // Add points
            // $enrollment->increment('points_balance', $points);

            // Log transaction (would need LoyaltyTransaction model)
            // LoyaltyTransaction::create([
            //     'user_id' => $user->id,
            //     'business_id' => $businessId,
            //     'points' => $points,
            //     'type' => 'earned',
            //     'reason' => $reason,
            //     'source_type' => $sourceType,
            //     'source_id' => $sourceId,
            // ]);

            DB::commit();

            // Clear cache
            $this->clearUserCache($user, $businessId);
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Redeem points
     */
    public function redeemPoints(User $user, Business|string $business, int $points, string $reason): void
    {
        $businessId = $business instanceof Business ? $business->id : $business;

        DB::beginTransaction();

        try {
            // Get enrollment
            // $enrollment = LoyaltyEnrollment::where('user_id', $user->id)
            //     ->where('business_id', $businessId)
            //     ->firstOrFail();

            // Check balance
            // if ($enrollment->points_balance < $points) {
            //     throw new \Exception('Insufficient points');
            // }

            // Deduct points
            // $enrollment->decrement('points_balance', $points);

            // Log transaction
            // LoyaltyTransaction::create([
            //     'user_id' => $user->id,
            //     'business_id' => $businessId,
            //     'points' => -$points,
            //     'type' => 'redeemed',
            //     'reason' => $reason,
            // ]);

            DB::commit();

            // Clear cache
            $this->clearUserCache($user, $businessId);
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get points balance
     */
    public function getBalance(User $user, Business|string $business): int
    {
        $businessId = $business instanceof Business ? $business->id : $business;
        $cacheKey = "loyalty:balance:{$user->id}:{$businessId}";

        return (int) $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () {
            // Would query LoyaltyEnrollment model
            // $enrollment = LoyaltyEnrollment::where('user_id', $user->id)
            //     ->where('business_id', $businessId)
            //     ->first();
            //
            // return $enrollment ? $enrollment->points_balance : 0;

            return 0;
        });
    }

    /**
     * Get points history
     */
    public function getHistory(User $user, Business|string $business, int $limit = 50): Collection
    {
        $businessId = $business instanceof Business ? $business->id : $business;
        $cacheKey = "loyalty:history:{$user->id}:{$businessId}:limit:{$limit}";

        return $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () {
            // Would query LoyaltyTransaction model
            // return LoyaltyTransaction::where('user_id', $user->id)
            //     ->where('business_id', $businessId)
            //     ->orderBy('created_at', 'desc')
            //     ->limit($limit)
            //     ->get();

            return collect([]);
        });
    }

    /**
     * Get user's loyalty programs
     */
    public function getUserPrograms(User $user): Collection
    {
        $cacheKey = "loyalty:programs:{$user->id}";

        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () {
            // Would query LoyaltyEnrollment model
            // return LoyaltyEnrollment::where('user_id', $user->id)
            //     ->with('business')
            //     ->get();

            return collect([]);
        });
    }

    /**
     * Get business loyalty program stats
     */
    public function getBusinessStats(Business|string $business): array
    {
        $businessId = $business instanceof Business ? $business->id : $business;
        $cacheKey = "loyalty:stats:business:{$businessId}";

        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () {
            // Would query LoyaltyEnrollment and LoyaltyTransaction models
            // return [
            //     'total_enrollments' => LoyaltyEnrollment::where('business_id', $businessId)->count(),
            //     'total_points_earned' => LoyaltyTransaction::where('business_id', $businessId)->where('type', 'earned')->sum('points'),
            //     'total_points_redeemed' => abs(LoyaltyTransaction::where('business_id', $businessId)->where('type', 'redeemed')->sum('points')),
            //     'active_points' => LoyaltyEnrollment::where('business_id', $businessId)->sum('points_balance'),
            // ];

            return [
                'total_enrollments' => 0,
                'total_points_earned' => 0,
                'total_points_redeemed' => 0,
                'active_points' => 0,
            ];
        });
    }

    /**
     * Clear user-related cache
     */
    private function clearUserCache(User $user, ?string $businessId = null): void
    {
        if ($businessId) {
            $this->cacheService->forget("loyalty:balance:{$user->id}:{$businessId}");
            $this->cacheService->forget("loyalty:history:{$user->id}:{$businessId}:*");
        }

        $this->cacheService->forget("loyalty:programs:{$user->id}");
    }
}
