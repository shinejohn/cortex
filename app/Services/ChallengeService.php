<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Challenge;
use App\Models\ChallengeParticipation;
use App\Models\User;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class ChallengeService
{
    public function __construct(
        private readonly CacheService $cacheService,
        private readonly GamificationService $gamificationService
    ) {}

    /**
     * Join a challenge
     */
    public function joinChallenge(User $user, Challenge|string $challenge): void
    {
        $challengeId = $challenge instanceof Challenge ? $challenge->id : $challenge;

        DB::beginTransaction();

        try {
            $challengeModel = $challenge instanceof Challenge ? $challenge : Challenge::findOrFail($challengeId);

            // Check if already participating
            $exists = ChallengeParticipation::where('user_id', $user->id)
                ->where('challenge_id', $challengeId)
                ->exists();

            if ($exists) {
                return;
            }

            // Create participation
            ChallengeParticipation::create([
                'user_id' => $user->id,
                'challenge_id' => $challengeId,
                'status' => 'active',
                'progress' => 0,
                'started_at' => now(),
                // 'joined_at' in migration? No, migration has 'started_at', 'completed_at'.
            ]);

            DB::commit();

            // Clear cache
            $this->clearUserCache($user);
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Track challenge progress
     */
    public function trackProgress(User $user, Challenge|string $challenge, int $progressIncrement = 1): void
    {
        $challengeId = $challenge instanceof Challenge ? $challenge->id : $challenge;

        DB::beginTransaction();

        try {
            $participation = ChallengeParticipation::where('user_id', $user->id)
                ->where('challenge_id', $challengeId)
                ->where('status', 'active')
                ->first();

            if (! $participation) {
                return;
            }

            $challengeModel = $challenge instanceof Challenge ? $challenge : Challenge::find($challengeId);

            // Increment progress
            $participation->increment('progress', $progressIncrement);

            // Check completion
            // Assuming validation logic depends on challenge type, simple threshold check for now
            if ($challengeModel && $participation->progress >= ($challengeModel->requirements['target_value'] ?? 100)) {
                $this->completeChallenge($user, $challengeModel, $participation);
            }

            DB::commit();

            // Clear cache
            $this->clearUserCache($user);
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get available challenges for user
     */
    public function getAvailableChallenges(User $user): Collection
    {
        $cacheKey = "challenges:available:{$user->id}";

        return $this->cacheService->remember($cacheKey, 600, function () use ($user) {
            // Get IDs of challenges user is already participating in
            $participatingIds = ChallengeParticipation::where('user_id', $user->id)
                ->pluck('challenge_id');

            return Challenge::whereNotIn('id', $participatingIds)
                ->where('is_active', true)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->orderBy('title')
                ->get();
        });
    }

    /**
     * Get user's challenges (active and completed)
     */
    public function getUserChallenges(User $user, ?string $status = null): Collection
    {
        $cacheKey = "challenges:user:{$user->id}:".($status ?? 'all');

        return $this->cacheService->remember($cacheKey, 600, function () use ($user, $status) {
            $query = ChallengeParticipation::where('user_id', $user->id)
                ->with('challenge');

            if ($status) {
                $query->where('status', $status);
            }

            return $query->orderBy('started_at', 'desc')->get();
        });
    }

    /**
     * Complete a challenge
     */
    private function completeChallenge(User $user, Challenge $challenge, ChallengeParticipation $participation): void
    {
        $participation->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Award points
        if ($challenge->points > 0) {
            $this->gamificationService->awardPoints(
                $user,
                $challenge->points,
                "Challenge Completed: {$challenge->title}",
                'challenge',
                $challenge->id
            );
        }

        // Award other rewards? (logic stub)
    }

    /**
     * Clear user-related cache
     */
    private function clearUserCache(User $user): void
    {
        $this->cacheService->forget("challenges:available:{$user->id}");
        $this->cacheService->forget("challenges:user:{$user->id}:*");
    }
}
