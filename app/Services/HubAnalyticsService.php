<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Hub;
use App\Models\HubAnalytics;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class HubAnalyticsService
{
    public function trackPageView(Hub $hub): void
    {
        $today = now()->toDateString();

        HubAnalytics::updateOrCreate(
            [
                'hub_id' => $hub->id,
                'date' => $today,
            ],
            [],
            function ($query) {
                $query->increment('page_views');
            }
        );
    }

    public function trackUniqueVisitor(Hub $hub): void
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
    }

    public function trackEventCreated(Hub $hub): void
    {
        $today = now()->toDateString();

        $analytics = HubAnalytics::firstOrCreate(
            [
                'hub_id' => $hub->id,
                'date' => $today,
            ],
            [
                'events_created' => 0,
            ]
        );

        $analytics->increment('events_created');
    }

    public function trackEventPublished(Hub $hub): void
    {
        $today = now()->toDateString();

        $analytics = HubAnalytics::firstOrCreate(
            [
                'hub_id' => $hub->id,
                'date' => $today,
            ],
            [
                'events_published' => 0,
            ]
        );

        $analytics->increment('events_published');
    }

    public function trackMemberJoined(Hub $hub): void
    {
        $today = now()->toDateString();

        $analytics = HubAnalytics::firstOrCreate(
            [
                'hub_id' => $hub->id,
                'date' => $today,
            ],
            [
                'members_joined' => 0,
            ]
        );

        $analytics->increment('members_joined');
    }

    public function trackFollowerGained(Hub $hub): void
    {
        $today = now()->toDateString();

        $analytics = HubAnalytics::firstOrCreate(
            [
                'hub_id' => $hub->id,
                'date' => $today,
            ],
            [
                'followers_gained' => 0,
            ]
        );

        $analytics->increment('followers_gained');
    }

    public function getAnalytics(Hub $hub, string $startDate, string $endDate): Collection
    {
        return HubAnalytics::where('hub_id', $hub->id)
            ->forDateRange($startDate, $endDate)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function getTotals(Hub $hub, string $startDate, string $endDate): array
    {
        $analytics = $this->getAnalytics($hub, $startDate, $endDate);

        return [
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
    }

    public function calculateEngagementScore(Hub $hub, string $date): float
    {
        $analytics = HubAnalytics::where('hub_id', $hub->id)
            ->where('date', $date)
            ->first();

        if (!$analytics) {
            return 0.0;
        }

        // Simple engagement score calculation
        $score = ($analytics->page_views * 0.1)
            + ($analytics->unique_visitors * 0.5)
            + ($analytics->events_published * 2.0)
            + ($analytics->articles_published * 1.5)
            + ($analytics->members_joined * 3.0)
            + ($analytics->followers_gained * 5.0);

        return round($score, 2);
    }
}

