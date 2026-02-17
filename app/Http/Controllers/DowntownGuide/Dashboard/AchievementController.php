<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AchievementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $business = $user->business;

        if (! $business) {
            return Inertia::render('downtown-guide/dashboard/business/create');
        }

        $achievements = Achievement::where('business_id', $business->id)
            ->orderBy('achievement_date', 'desc')
            ->get();

        return Inertia::render('downtown-guide/dashboard/achievements/index', [
            'achievements' => $achievements,
            'business' => $business,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user();
        $business = $user->business;

        if (! $business) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'source_name' => 'required|string|max:255',
            'achievement_date' => 'required|date',
            'description' => 'nullable|string',
            'source_url' => 'nullable|url',
        ]);

        $validated['business_id'] = $business->id;
        // Verify defaults
        $validated['is_verified'] = false; // Business added ones need verification? Or assume trusted?
        // Let's assume trusted for now, or false until admin approves.

        Achievement::create($validated);

        return redirect()->route('downtown-guide.dashboard.achievements.index')
            ->with('success', 'Achievement added successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Achievement $achievement): \Illuminate\Http\RedirectResponse
    {
        // Policy check
        if ($achievement->business_id !== $request->user()->business->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'source_name' => 'required|string|max:255',
            'achievement_date' => 'required|date',
            'description' => 'nullable|string',
            'source_url' => 'nullable|url',
        ]);

        $achievement->update($validated);

        return redirect()->route('downtown-guide.dashboard.achievements.index')
            ->with('success', 'Achievement updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Achievement $achievement): \Illuminate\Http\RedirectResponse
    {
        // Policy check
        if ($achievement->business_id !== $request->user()->business->id) {
            abort(403);
        }

        $achievement->delete();

        return redirect()->route('downtown-guide.dashboard.achievements.index')
            ->with('success', 'Achievement removed successfully.');
    }
}
