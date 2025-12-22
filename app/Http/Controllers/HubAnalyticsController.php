<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Hub;
use App\Models\HubAnalytics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

final class HubAnalyticsController extends Controller
{
    public function index(Hub $hub, Request $request): Response
    {
        $this->authorize('view', $hub);

        $dateRange = $request->input('date_range', '30');
        $startDate = now()->subDays((int) $dateRange)->startOfDay();
        $endDate = now()->endOfDay();

        $analytics = HubAnalytics::where('hub_id', $hub->id)
            ->forDateRange($startDate->toDateString(), $endDate->toDateString())
            ->orderBy('date', 'desc')
            ->get();

        // Calculate totals
        $totals = [
            'page_views' => $analytics->sum('page_views'),
            'unique_visitors' => $analytics->sum('unique_visitors'),
            'events_created' => $analytics->sum('events_created'),
            'events_published' => $analytics->sum('events_published'),
            'articles_created' => $analytics->sum('articles_created'),
            'articles_published' => $analytics->sum('articles_published'),
            'members_joined' => $analytics->sum('members_joined'),
            'followers_gained' => $analytics->sum('followers_gained'),
            'revenue' => $analytics->sum('revenue'),
        ];

        // Calculate averages
        $days = $analytics->count() ?: 1;
        $averages = [
            'page_views' => round($totals['page_views'] / $days, 2),
            'unique_visitors' => round($totals['unique_visitors'] / $days, 2),
            'engagement_score' => round($analytics->avg('engagement_score') ?? 0, 2),
        ];

        return Inertia::render('event-city/hubs/analytics', [
            'hub' => $hub,
            'analytics' => $analytics,
            'totals' => $totals,
            'averages' => $averages,
            'dateRange' => $dateRange,
        ]);
    }

    public function trackPageView(Hub $hub): JsonResponse
    {
        $today = now()->toDateString();

        HubAnalytics::updateOrCreate(
            [
                'hub_id' => $hub->id,
                'date' => $today,
            ],
            [
                'page_views' => DB::raw('page_views + 1'),
            ]
        );

        return response()->json(['success' => true]);
    }

    public function trackVisitor(Hub $hub, Request $request): JsonResponse
    {
        $today = now()->toDateString();

        $analytics = HubAnalytics::firstOrCreate(
            [
                'hub_id' => $hub->id,
                'date' => $today,
            ],
            [
                'page_views' => 0,
                'unique_visitors' => 0,
            ]
        );

        $analytics->increment('unique_visitors');

        return response()->json(['success' => true]);
    }

    public function getStats(Hub $hub, Request $request): JsonResponse
    {
        $this->authorize('view', $hub);

        $dateRange = $request->input('date_range', '30');
        $startDate = now()->subDays((int) $dateRange)->startOfDay();
        $endDate = now()->endOfDay();

        $analytics = HubAnalytics::where('hub_id', $hub->id)
            ->forDateRange($startDate->toDateString(), $endDate->toDateString())
            ->get();

        return response()->json([
            'totals' => [
                'page_views' => $analytics->sum('page_views'),
                'unique_visitors' => $analytics->sum('unique_visitors'),
                'events_created' => $analytics->sum('events_created'),
                'events_published' => $analytics->sum('events_published'),
                'articles_created' => $analytics->sum('articles_created'),
                'articles_published' => $analytics->sum('articles_published'),
                'members_joined' => $analytics->sum('members_joined'),
                'followers_gained' => $analytics->sum('followers_gained'),
                'revenue' => $analytics->sum('revenue'),
            ],
            'chart_data' => $analytics->map(function ($item) {
                return [
                    'date' => $item->date->format('Y-m-d'),
                    'page_views' => $item->page_views,
                    'unique_visitors' => $item->unique_visitors,
                    'engagement_score' => $item->engagement_score,
                ];
            }),
        ]);
    }
}
