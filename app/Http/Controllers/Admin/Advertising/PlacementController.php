<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Advertising;

use App\Http\Controllers\Controller;
use App\Models\AdPlacement;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class PlacementController extends Controller
{
    public function index(Request $request): Response
    {
        $placements = AdPlacement::query()
            ->when($request->platform, fn($q, $p) => $q->where('platform', $p))
            ->when($request->is_active !== null, fn($q) => $q->where('is_active', $request->is_active))
            ->orderBy('platform')
            ->orderBy('priority')
            ->paginate(25);

        return Inertia::render('Admin/Advertising/Placements/Index', [
            'placements' => $placements,
            'filters' => $request->only(['platform', 'is_active']),
            'platforms' => ['day_news', 'goeventcity', 'downtown_guide', 'alphasite_community', 'golocalvoices'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Advertising/Placements/Create', [
            'platforms' => ['day_news', 'goeventcity', 'downtown_guide', 'alphasite_community', 'golocalvoices'],
            'formats' => ['leaderboard', 'medium_rectangle', 'sidebar', 'native', 'sponsored_article', 'audio', 'video'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform' => 'required|string',
            'slot' => 'required|string',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'format' => 'required|string',
            'width' => 'required|integer|min:1',
            'height' => 'required|integer|min:1',
            'base_cpm' => 'required|numeric|min:0',
            'base_cpc' => 'nullable|numeric|min:0',
            'priority' => 'nullable|integer|min:0',
        ]);

        $placement = AdPlacement::create($validated);

        return redirect()
            ->route('admin.advertising.placements.show', $placement)
            ->with('success', 'Placement created successfully.');
    }

    public function show(AdPlacement $placement): Response
    {
        return Inertia::render('Admin/Advertising/Placements/Show', [
            'placement' => $placement,
        ]);
    }

    public function edit(AdPlacement $placement): Response
    {
        return Inertia::render('Admin/Advertising/Placements/Edit', [
            'placement' => $placement,
            'platforms' => ['day_news', 'goeventcity', 'downtown_guide', 'alphasite_community', 'golocalvoices'],
            'formats' => ['leaderboard', 'medium_rectangle', 'sidebar', 'native', 'sponsored_article', 'audio', 'video'],
        ]);
    }

    public function update(Request $request, AdPlacement $placement): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_cpm' => 'required|numeric|min:0',
            'base_cpc' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'priority' => 'nullable|integer|min:0',
        ]);

        $placement->update($validated);

        return redirect()
            ->route('admin.advertising.placements.show', $placement)
            ->with('success', 'Placement updated successfully.');
    }
}
