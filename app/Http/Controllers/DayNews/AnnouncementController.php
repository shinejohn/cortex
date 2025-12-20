<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Http\Requests\DayNews\StoreAnnouncementRequest;
use App\Http\Requests\DayNews\UpdateAnnouncementRequest;
use App\Models\Announcement;
use App\Models\Region;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AnnouncementController extends Controller
{
    /**
     * Display announcements listing
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $type = $request->get('type', 'all');
        $search = $request->get('search', '');

        $query = Announcement::published()
            ->with(['user', 'regions'])
            ->orderBy('published_at', 'desc');

        // Filter by region
        if ($currentRegion) {
            $query->forRegion($currentRegion->id);
        }

        // Filter by type
        if ($type !== 'all') {
            $query->byType($type);
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $announcements = $query->paginate(20)->withQueryString();

        // Get featured announcement (most reactions)
        $featured = Announcement::published()
            ->when($currentRegion, function ($q) use ($currentRegion) {
                $q->forRegion($currentRegion->id);
            })
            ->orderBy('reactions_count', 'desc')
            ->with(['user', 'regions'])
            ->first();

        return Inertia::render('day-news/announcements/index', [
            'announcements' => $announcements,
            'featured' => $featured,
            'filters' => [
                'type' => $type,
                'search' => $search,
            ],
            'currentRegion' => $currentRegion,
        ]);
    }

    /**
     * Show announcement creation form
     */
    public function create(): Response
    {
        return Inertia::render('day-news/announcements/create');
    }

    /**
     * Store new announcement
     */
    public function store(StoreAnnouncementRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $announcement = Announcement::create([
            'user_id' => $request->user()->id,
            'workspace_id' => $request->user()->currentWorkspace?->id,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'location' => $validated['location'] ?? null,
            'event_date' => $validated['event_date'] ?? null,
            'status' => 'published', // Announcements are free to publish
            'published_at' => now(),
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('announcements', 'public');
            $announcement->update(['image' => $path]);
        }

        // Attach regions
        if (!empty($validated['region_ids'])) {
            $announcement->regions()->attach($validated['region_ids']);
        } elseif ($currentRegion = $request->attributes->get('detected_region')) {
            $announcement->regions()->attach($currentRegion->id);
        }

        return redirect()
            ->route('day-news.announcements.show', $announcement->id)
            ->with('success', 'Announcement published successfully!');
    }

    /**
     * Display single announcement
     */
    public function show(Request $request, Announcement $announcement): Response
    {
        $announcement->load(['user', 'regions', 'ratings', 'reviews']);
        $announcement->incrementViewsCount();

        // Get related announcements
        $related = Announcement::published()
            ->where('id', '!=', $announcement->id)
            ->where('type', $announcement->type)
            ->whereHas('regions', function ($q) use ($announcement) {
                $q->whereIn('region_id', $announcement->regions->pluck('id'));
            })
            ->with(['user', 'regions'])
            ->limit(6)
            ->get();

        return Inertia::render('day-news/announcements/show', [
            'announcement' => [
                'id' => $announcement->id,
                'type' => $announcement->type,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'image' => $announcement->image,
                'location' => $announcement->location,
                'event_date' => $announcement->event_date?->toDateString(),
                'published_at' => $announcement->published_at?->toISOString(),
                'views_count' => $announcement->views_count,
                'reactions_count' => $announcement->reactions_count,
                'comments_count' => $announcement->comments_count,
                'user' => [
                    'id' => $announcement->user->id,
                    'name' => $announcement->user->name,
                    'avatar' => $announcement->user->profile_photo_url ?? null,
                ],
                'regions' => $announcement->regions->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                ]),
            ],
            'related' => $related->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'content' => $item->content,
                'image' => $item->image,
            ]),
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(Announcement $announcement): Response
    {
        $this->authorize('update', $announcement);

        $announcement->load(['regions']);

        return Inertia::render('day-news/announcements/edit', [
            'announcement' => $announcement,
        ]);
    }

    /**
     * Update announcement
     */
    public function update(UpdateAnnouncementRequest $request, Announcement $announcement): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $announcement->update($validated);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('announcements', 'public');
            $announcement->update(['image' => $path]);
        }

        // Update regions
        if (isset($validated['region_ids'])) {
            $announcement->regions()->sync($validated['region_ids']);
        }

        return redirect()
            ->route('day-news.announcements.show', $announcement->id)
            ->with('success', 'Announcement updated successfully!');
    }

    /**
     * Delete announcement
     */
    public function destroy(Announcement $announcement): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('delete', $announcement);

        $announcement->delete();

        return redirect()
            ->route('day-news.announcements.index')
            ->with('success', 'Announcement deleted successfully!');
    }
}

