<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\SocialFeedAlgorithmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SocialFeedController extends Controller
{
    public function __construct(
        private readonly SocialFeedAlgorithmService $feedService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $page = $request->integer('page', 1);
        $feedType = $request->string('feed', 'for-you');

        $forYouFeed = $this->feedService->getForYouFeed($user, $page);
        $followedFeed = $this->feedService->getFollowedFeed($user, $page);

        return Inertia::render('event-city/social/Feed', [
            'forYouFeed' => $forYouFeed,
            'followedFeed' => $followedFeed,
            'currentFeed' => $feedType,
        ]);
    }

    public function forYou(Request $request): JsonResponse
    {
        $user = $request->user();
        $page = $request->integer('page', 1);
        $perPage = $request->integer('per_page', 20);

        $feed = $this->feedService->getForYouFeed($user, $page, $perPage);

        return response()->json([
            'data' => $feed->items(),
            'pagination' => [
                'current_page' => $feed->currentPage(),
                'last_page' => $feed->lastPage(),
                'per_page' => $feed->perPage(),
                'total' => $feed->total(),
                'has_more' => $feed->hasMorePages(),
            ],
        ]);
    }

    public function followed(Request $request): JsonResponse
    {
        $user = $request->user();
        $page = $request->integer('page', 1);
        $perPage = $request->integer('per_page', 20);

        $feed = $this->feedService->getFollowedFeed($user, $page, $perPage);

        return response()->json([
            'data' => $feed->items(),
            'pagination' => [
                'current_page' => $feed->currentPage(),
                'last_page' => $feed->lastPage(),
                'per_page' => $feed->perPage(),
                'total' => $feed->total(),
                'has_more' => $feed->hasMorePages(),
            ],
        ]);
    }
}
