<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AchievementController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamificationService
    ) {}

    /**
     * Display achievements listing
     */
    public function index(Request $request): Response
    {
        $category = $request->input('category');
        $rarity = $request->input('rarity');

        $achievements = $this->gamificationService->getAchievements([
            'category' => $category,
            'rarity' => $rarity,
        ]);

        // Get user's achievements if authenticated
        $userAchievements = collect([]);
        if ($request->user()) {
            $userAchievements = $this->gamificationService->getUserAchievements($request->user());
        }

        return Inertia::render('downtown-guide/achievements/index', [
            'achievements' => $achievements,
            'userAchievements' => $userAchievements,
            'filters' => [
                'category' => $category,
                'rarity' => $rarity,
            ],
            'platform' => 'downtownsguide',
        ]);
    }

    /**
     * Display leaderboard
     */
    public function leaderboard(Request $request): Response
    {
        $period = $request->input('period', 'all_time'); // daily, weekly, monthly, all_time
        $type = $request->input('type', 'points'); // points, reviews, visits, referrals

        $leaderboard = $this->gamificationService->getLeaderboard($type, $period, 100);

        return Inertia::render('downtown-guide/achievements/leaderboard', [
            'leaderboard' => $leaderboard,
            'period' => $period,
            'type' => $type,
            'platform' => 'downtownsguide',
        ]);
    }
}

