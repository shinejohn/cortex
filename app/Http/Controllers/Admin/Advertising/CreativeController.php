<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Advertising;

use App\Http\Controllers\Controller;
use App\Models\AdCampaign;
use App\Models\AdCreative;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class CreativeController extends Controller
{
    public function index(Request $request): Response
    {
        $creatives = AdCreative::query()
            ->with('campaign:id,name')
            ->when($request->campaign_id, fn($q, $c) => $q->where('campaign_id', $c))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('Admin/Advertising/Creatives/Index', [
            'creatives' => $creatives,
            'filters' => $request->only(['campaign_id', 'status']),
            'campaigns' => AdCampaign::select('id', 'name')->orderBy('name')->get(),
            'statuses' => ['draft', 'pending_review', 'approved', 'rejected', 'active', 'paused'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Advertising/Creatives/Create', [
            'campaigns' => AdCampaign::select('id', 'name')->orderBy('name')->get(),
            'formats' => ['leaderboard', 'medium_rectangle', 'sidebar', 'native', 'sponsored_article', 'audio', 'video'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'campaign_id' => 'required|exists:ad_campaigns,id',
            'name' => 'required|string|max:255',
            'format' => 'required|in:leaderboard,medium_rectangle,sidebar,native,sponsored_article,audio,video',
            'headline' => 'nullable|string|max:255',
            'body' => 'nullable|string',
            'image_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'audio_url' => 'nullable|url',
            'click_url' => 'required|url',
            'cta_text' => 'nullable|string|max:50',
            'width' => 'nullable|integer',
            'height' => 'nullable|integer',
        ]);

        $creative = AdCreative::create($validated);

        return redirect()
            ->route('admin.advertising.creatives.show', $creative)
            ->with('success', 'Creative created successfully.');
    }

    public function show(AdCreative $creative): Response
    {
        $creative->load('campaign');

        return Inertia::render('Admin/Advertising/Creatives/Show', [
            'creative' => $creative,
            'stats' => [
                'impressions' => $creative->impressions()->count(),
                'clicks' => $creative->clicks()->count(),
                'ctr' => $creative->ctr,
            ],
        ]);
    }

    public function edit(AdCreative $creative): Response
    {
        return Inertia::render('Admin/Advertising/Creatives/Edit', [
            'creative' => $creative,
            'campaigns' => AdCampaign::select('id', 'name')->orderBy('name')->get(),
            'formats' => ['leaderboard', 'medium_rectangle', 'sidebar', 'native', 'sponsored_article', 'audio', 'video'],
        ]);
    }

    public function update(Request $request, AdCreative $creative): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'format' => 'required|in:leaderboard,medium_rectangle,sidebar,native,sponsored_article,audio,video',
            'headline' => 'nullable|string|max:255',
            'body' => 'nullable|string',
            'image_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'audio_url' => 'nullable|url',
            'click_url' => 'required|url',
            'cta_text' => 'nullable|string|max:50',
            'width' => 'nullable|integer',
            'height' => 'nullable|integer',
        ]);

        $creative->update($validated);

        return redirect()
            ->route('admin.advertising.creatives.show', $creative)
            ->with('success', 'Creative updated successfully.');
    }

    public function updateStatus(Request $request, AdCreative $creative): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending_review,approved,rejected,active,paused',
        ]);

        $creative->update($validated);

        return back()->with('success', 'Creative status updated.');
    }
}
