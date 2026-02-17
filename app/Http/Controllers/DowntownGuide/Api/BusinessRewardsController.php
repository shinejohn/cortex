<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use App\Services\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BusinessRewardsController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamificationService,
        private readonly LoyaltyService $loyaltyService
    ) {}

    /**
     * Get business loyalty program stats.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->business) {
            return response()->json(['error' => 'No business associated'], 404);
        }

        $stats = $this->gamificationService->getLoyaltyStats($user->business);

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * Get loyalty program details.
     */
    public function program(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->business) {
            return response()->json(['error' => 'No business associated'], 404);
        }

        $program = $this->loyaltyService->getProgram($user->business);

        if (! $program) {
            return response()->json(['message' => 'No active program'], 404);
        }

        return response()->json([
            'data' => $program,
        ]);
    }
}
