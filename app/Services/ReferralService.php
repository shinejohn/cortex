<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class ReferralService
{
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Create referral code for user
     */
    public function createReferralCode(User $user): string
    {
        // Generate unique referral code if not exists
        if (!$user->referral_code) {
            do {
                $code = strtoupper(Str::random(8));
            } while (User::where('referral_code', $code)->exists());

            $user->update(['referral_code' => $code]);
            $this->clearUserCache($user);
        }

        return $user->referral_code;
    }

    /**
     * Track referral
     */
    public function trackReferral(User $referrer, User $referred, string $source = 'direct'): void
    {
        DB::beginTransaction();
        
        try {
            // Create referral record (would need Referral model)
            // Referral::create([
            //     'referrer_id' => $referrer->id,
            //     'referred_id' => $referred->id,
            //     'referral_code' => $referrer->referral_code,
            //     'source' => $source,
            //     'status' => 'pending',
            //     'referred_at' => now(),
            // ]);

            // Update referred user
            $referred->update(['referred_by_id' => $referrer->id]);

            DB::commit();

            // Clear cache
            $this->clearUserCache($referrer);
            $this->clearUserCache($referred);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get referrals for user
     */
    public function getReferrals(User $user, string $status = 'all'): Collection
    {
        $cacheKey = "referrals:{$user->id}:{$status}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($user, $status) {
            // Would query Referral model
            // $query = Referral::where('referrer_id', $user->id)
            //     ->with('referred');
            //
            // if ($status !== 'all') {
            //     $query->where('status', $status);
            // }
            //
            // return $query->orderBy('referred_at', 'desc')->get();
            
            return collect([]);
        });
    }

    /**
     * Get referral stats
     */
    public function getReferralStats(User $user): array
    {
        $cacheKey = "referrals:stats:{$user->id}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($user) {
            // Would query Referral model
            // return [
            //     'total_referrals' => Referral::where('referrer_id', $user->id)->count(),
            //     'active_referrals' => Referral::where('referrer_id', $user->id)->where('status', 'active')->count(),
            //     'pending_referrals' => Referral::where('referrer_id', $user->id)->where('status', 'pending')->count(),
            //     'total_rewards' => Referral::where('referrer_id', $user->id)->sum('reward_amount'),
            // ];
            
            return [
                'total_referrals' => 0,
                'active_referrals' => 0,
                'pending_referrals' => 0,
                'total_rewards' => 0,
            ];
        });
    }

    /**
     * Award referral bonus
     */
    public function awardReferralBonus(User $referrer, User $referred, int $points, string $reason = 'referral_bonus'): void
    {
        DB::beginTransaction();
        
        try {
            // Update referral status
            // $referral = Referral::where('referrer_id', $referrer->id)
            //     ->where('referred_id', $referred->id)
            //     ->first();
            //
            // if ($referral) {
            //     $referral->update([
            //         'status' => 'active',
            //         'reward_amount' => $points,
            //         'rewarded_at' => now(),
            //     ]);
            // }

            // Award points to referrer (using GamificationService if available)
            // app(GamificationService::class)->awardPoints($referrer, $points, $reason, 'referral', $referral->id ?? null);

            DB::commit();

            // Clear cache
            $this->clearUserCache($referrer);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Validate referral code
     */
    public function validateReferralCode(string $code): ?User
    {
        return User::where('referral_code', $code)->first();
    }

    /**
     * Get referral chain (who referred this user and who they referred)
     */
    public function getReferralChain(User $user): array
    {
        $cacheKey = "referrals:chain:{$user->id}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($user) {
            $chain = [
                'referred_by' => null,
                'referred_users' => [],
            ];

            // Get who referred this user
            if ($user->referred_by_id) {
                $chain['referred_by'] = User::find($user->referred_by_id);
            }

            // Get users referred by this user
            // $chain['referred_users'] = Referral::where('referrer_id', $user->id)
            //     ->with('referred')
            //     ->get()
            //     ->pluck('referred');

            return $chain;
        });
    }

    /**
     * Clear user-related cache
     */
    private function clearUserCache(User $user): void
    {
        $this->cacheService->forget("referrals:{$user->id}:*");
        $this->cacheService->forget("referrals:stats:{$user->id}");
        $this->cacheService->forget("referrals:chain:{$user->id}");
    }
}

