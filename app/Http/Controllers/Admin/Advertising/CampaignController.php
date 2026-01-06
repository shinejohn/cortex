<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Advertising;

use App\Http\Controllers\Controller;
use App\Models\AdCampaign;
use App\Models\Business;
use App\Services\AdServerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class CampaignController extends Controller
{
    public function __construct(
        private readonly AdServerService $adService
    ) {}

    public function index(Request $request): Response
    {
        $campaigns = AdCampaign::query()
            ->with('advertiser:id,name')
            ->withCount('creatives')
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderByDesc('created_at')
            ->paginate(25);

        // Add stats to each campaign
        $campaigns->getCollection()->transform(function ($campaign) {
            $campaign->stats = $this->adService->getCampaignStats($campaign);
            return $campaign;
        });

        return Inertia::render('Admin/Advertising/Campaigns/Index', [
            'campaigns' => $campaigns,
            'filters' => $request->only(['status', 'search']),
            'statuses' => ['draft', 'pending', 'active', 'paused', 'completed', 'cancelled'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Advertising/Campaigns/Create', [
            'advertisers' => Business::select('id', 'name')->orderBy('name')->get(),
            'platforms' => ['day_news', 'goeventcity', 'downtown_guide', 'alphasite_community', 'golocalvoices'],
            'campaignTypes' => ['cpm', 'cpc', 'flat_rate', 'sponsored'],
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'advertiser_id' => 'required|exists:businesses,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:cpm,cpc,flat_rate,sponsored',
            'budget' => 'required|numeric|min:0',
            'daily_budget' => 'nullable|numeric|min:0',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'platforms' => 'required|array|min:1',
            'targeting' => 'nullable|array',
        ]);

        $campaign = AdCampaign::create($validated);

        return redirect()
            ->route('admin.advertising.campaigns.show', $campaign)
            ->with('success', 'Campaign created successfully.');
    }

    public function show(AdCampaign $campaign): Response
    {
        $campaign->load(['advertiser', 'creatives']);

        return Inertia::render('Admin/Advertising/Campaigns/Show', [
            'campaign' => $campaign,
            'stats' => $this->adService->getCampaignStats($campaign),
            'dailyStats' => $this->getDailyStats($campaign),
        ]);
    }

    public function edit(AdCampaign $campaign): Response
    {
        return Inertia::render('Admin/Advertising/Campaigns/Edit', [
            'campaign' => $campaign,
            'advertisers' => Business::select('id', 'name')->orderBy('name')->get(),
            'platforms' => ['day_news', 'goeventcity', 'downtown_guide', 'alphasite_community', 'golocalvoices'],
            'campaignTypes' => ['cpm', 'cpc', 'flat_rate', 'sponsored'],
        ]);
    }

    public function update(Request $request, AdCampaign $campaign): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget' => 'required|numeric|min:' . $campaign->spent,
            'daily_budget' => 'nullable|numeric|min:0',
            'end_date' => 'required|date|after:start_date',
            'platforms' => 'required|array|min:1',
            'targeting' => 'nullable|array',
        ]);

        $campaign->update($validated);

        return redirect()
            ->route('admin.advertising.campaigns.show', $campaign)
            ->with('success', 'Campaign updated successfully.');
    }

    public function updateStatus(Request $request, AdCampaign $campaign): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:active,paused,cancelled',
        ]);

        $campaign->update($validated);

        return back()->with('success', 'Campaign status updated.');
    }

    protected function getDailyStats(AdCampaign $campaign): array
    {
        // Get last 30 days of stats
        return DB::table('ad_impressions')
            ->selectRaw('DATE(impressed_at) as date, COUNT(*) as impressions')
            ->whereIn('creative_id', $campaign->creatives->pluck('id'))
            ->where('impressed_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }
}
