<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Services\DayNews\TrendingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TrendingController extends Controller
{
    public function __construct(
        private readonly TrendingService $trendingService
    ) {}

    /**
     * Display trending page
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $timePeriod = $request->get('period', 'now'); // now, hour, day, week, month
        $category = $request->get('category', 'all'); // all, stories, topics, categories, people

        $data = [
            'stories' => [],
            'topics' => [],
            'categories' => [],
            'people' => [],
            'community_pulse' => [],
        ];

        if ($category === 'all' || $category === 'stories') {
            $data['stories'] = $this->trendingService->getTrendingStories($timePeriod, $currentRegion, 20);
        }

        if ($category === 'all' || $category === 'topics') {
            $data['topics'] = $this->trendingService->getTrendingTopics($timePeriod, $currentRegion, 10);
        }

        if ($category === 'all' || $category === 'categories') {
            $data['categories'] = $this->trendingService->getTrendingCategories($timePeriod, $currentRegion, 10);
        }

        if ($category === 'all' || $category === 'people') {
            $data['people'] = $this->trendingService->getTrendingPeople($timePeriod, $currentRegion, 10);
        }

        if ($category === 'all') {
            $data['community_pulse'] = $this->trendingService->getCommunityPulse($currentRegion);
        }

        // Get active readers count (simplified - users who viewed articles in last hour)
        $activeReaders = \App\Models\User::whereHas('authoredDayNewsPosts', function ($q) {
            $q->published()->where('published_at', '>=', now()->subHour());
        })->count();

        return Inertia::render('day-news/trending/index', [
            'timePeriod' => $timePeriod,
            'category' => $category,
            'trendingStories' => $data['stories'],
            'trendingTopics' => $data['topics'],
            'trendingCategories' => $data['categories'],
            'trendingPeople' => $data['people'],
            'communityPulse' => $data['community_pulse'],
            'activeReaders' => $activeReaders,
            'currentRegion' => $currentRegion,
        ]);
    }
}

