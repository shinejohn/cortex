<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Api\V1\AchievementResource;
use App\Models\Achievement;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AchievementController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Achievement::query();

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        $achievements = $query->orderBy('achievement_date', 'desc')->paginate($request->get('per_page', 20));
        return $this->paginated($achievements);
    }

    public function businessAchievements(Request $request, Business $business): JsonResponse
    {
        $achievements = $business->achievements()->orderBy('display_order')->get();
        return $this->success(AchievementResource::collection($achievements));
    }
}


