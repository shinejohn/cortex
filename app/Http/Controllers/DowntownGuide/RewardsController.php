<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class RewardsController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamificationService,
        private readonly LoyaltyService $loyaltyService
    ) {}

    /**
     * Display the rewards dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get user global stats
        $level = $this->gamificationService->getUserLevel($user);
        $achievements = $this->gamificationService->getUserAchievements($user);
        $rank = $this->gamificationService->getUserRank($user);

        // Get loyalty programs and balances
        $loyaltyPrograms = $this->loyaltyService->getUserPrograms($user);

        return Inertia::render('downtown-guide/rewards/index', [
            'stats' => [
                'total_points' => $user->total_points,
                'lifetime_points' => $user->lifetime_points,
                'current_level' => $user->current_level, // Assuming it's stored on user model as string
                'level_number' => $level,
                'rank' => $rank,
            ],
            'achievements' => $achievements,
            'loyalty' => $loyaltyPrograms,
        ]);
    }

    /**
     * Display the leaderboard.
     */
    public function leaderboard(Request $request): Response
    {
        $leaderboard = $this->gamificationService->getLeaderboard('points', 'all_time', 50);

        return Inertia::render('downtown-guide/rewards/leaderboard', [
            'leaderboard' => $leaderboard,
            'userRank' => $this->gamificationService->getUserRank($request->user()),
        ]);
    }
}
