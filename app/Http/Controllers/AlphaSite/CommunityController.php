<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\AlphaSiteCommunity;
use App\Services\AlphaSite\CommunityService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CommunityController extends Controller
{
    public function __construct(
        private readonly CommunityService $communityService
    ) {}

    /**
     * Show community page
     */
    public function show(string $city, string $state, Request $request): Response
    {
        $community = $this->communityService->getOrCreateCommunity($city, $state);
        
        $businesses = $this->communityService->getCommunityBusinesses(
            $community,
            $request->input('category'),
            24
        );

        $categories = $this->communityService->getCommunityCategories($community);

        return Inertia::render('alphasite/community/show', [
            'community' => $community,
            'businesses' => $businesses,
            'categories' => $categories,
            'activeCategory' => $request->input('category'),
        ]);
    }

    /**
     * Downtown businesses
     */
    public function downtown(string $city, string $state, Request $request): Response
    {
        // Similar to show but filtered for downtown area
        return $this->show($city, $state, $request);
    }

    /**
     * Category filtered community page
     */
    public function category(string $city, string $state, string $category, Request $request): Response
    {
        $request->merge(['category' => $category]);
        return $this->show($city, $state, $request);
    }
}
