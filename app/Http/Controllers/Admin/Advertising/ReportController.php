<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Advertising;

use App\Http\Controllers\Controller;
use App\Models\AdCampaign;
use App\Services\AdServerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class ReportController extends Controller
{
    public function __construct(
        private readonly AdServerService $adService
    ) {}

    public function index(Request $request): Response
    {
        $dateFrom = $request->date_from ?? now()->subDays(30)->format('Y-m-d');
        $dateTo = $request->date_to ?? now()->format('Y-m-d');

        // Overall stats
        $stats = [
            'total_impressions' => DB::table('ad_impressions')
                ->whereBetween('impressed_at', [$dateFrom, $dateTo])
                ->count(),
            'total_clicks' => DB::table('ad_clicks')
                ->whereBetween('clicked_at', [$dateFrom, $dateTo])
                ->count(),
            'total_revenue' => DB::table('ad_impressions')
                ->whereBetween('impressed_at', [$dateFrom, $dateTo])
                ->sum('cost') + DB::table('ad_clicks')
                ->whereBetween('clicked_at', [$dateFrom, $dateTo])
                ->sum('cost'),
        ];

        $stats['ctr'] = $stats['total_impressions'] > 0
            ? round(($stats['total_clicks'] / $stats['total_impressions']) * 100, 2)
            : 0;

        return Inertia::render('Admin/Advertising/Reports/Index', [
            'stats' => $stats,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function campaign(AdCampaign $campaign): Response
    {
        $campaign->load('advertiser', 'creatives');
        $stats = $this->adService->getCampaignStats($campaign);

        // Daily breakdown
        $dailyStats = DB::table('ad_impressions')
            ->selectRaw('DATE(impressed_at) as date, COUNT(*) as impressions')
            ->whereIn('creative_id', $campaign->creatives->pluck('id'))
            ->where('impressed_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Admin/Advertising/Reports/Campaign', [
            'campaign' => $campaign,
            'stats' => $stats,
            'dailyStats' => $dailyStats,
        ]);
    }
}
