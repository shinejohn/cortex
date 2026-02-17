<?php

declare(strict_types=1);

namespace App\Http\Controllers\EventCity;

use App\Http\Controllers\Controller;
use App\Services\EventCity\AchievementBridgeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AchievementController extends Controller
{
    public function __construct(
        private readonly AchievementBridgeService $achievementService
    ) {}

    /**
     * Display the achievements gallery for the authenticated user.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $userAchievements = $this->achievementService->getUserAchievements($user);
        $definitions = $this->achievementService->getAchievementDefinitions();

        $totalPoints = $userAchievements->sum('points_awarded');

        return Inertia::render('event-city/achievements/index', [
            'achievements' => $userAchievements,
            'definitions' => $definitions,
            'totalPoints' => $totalPoints,
        ]);
    }
}
