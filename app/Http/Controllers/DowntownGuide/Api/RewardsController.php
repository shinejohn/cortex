<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class RewardsController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamificationService
    ) {}

    /**
     * Get user rewards summary.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $level = $this->gamificationService->getUserLevel($user);
        $achievements = $this->gamificationService->getUserAchievements($user);
        $points = $user->total_points ?? 0;

        return response()->json([
            'level' => $level,
            'achievements_count' => $achievements->count(),
            'points' => $points,
            'recent_achievements' => $achievements->take(5),
        ]);
    }

    /**
     * Get user achievements.
     */
    public function achievements(Request $request): JsonResponse
    {
        $achievements = $this->gamificationService->getUserAchievements($request->user());

        return response()->json([
            'data' => $achievements,
        ]);
    }

    /**
     * Get leaderboard.
     */
    public function leaderboard(Request $request): JsonResponse
    {
        $leaderboard = $this->gamificationService->getLeaderboard();

        return response()->json([
            'data' => $leaderboard,
        ]);
    }
}
