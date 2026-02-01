<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Http\Requests\DayNews\StoreAnnouncementRequest;
use App\Http\Requests\DayNews\UpdateAnnouncementRequest;
use App\Models\Announcement;
use App\Models\Region;
use App\Models\Event;
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
        
        // Transform announcements for high-fidelity UI
        $announcements->getCollection()->transform(function (Announcement $item) {
            return $this->transformAnnouncement($item);
        });

        // Get featured announcement (most reactions)
        $featuredPost = Announcement::published()
            ->when($currentRegion, function ($q) use ($currentRegion) {
                $q->forRegion($currentRegion->id);
            })
            ->orderBy('reactions_count', 'desc')
            ->with(['user', 'regions'])
            ->first();

        $featured = $featuredPost ? $this->transformAnnouncement($featuredPost) : null;

        // Get memorials for sidebar
        $memorials = Announcement::published()
            ->whereIn('type', ['memorial', 'obituary'])
            ->when($currentRegion, function ($q) use ($currentRegion) {
                $q->forRegion($currentRegion->id);
            })
            ->orderBy('published_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function (Announcement $item) {
                return $this->transformAnnouncement($item);
            });

        // Get upcoming events for sidebar
        $upcomingEvents = Event::where('event_date', '>=', now()->toDateString())
            ->when($currentRegion, function ($q) use ($currentRegion) {
                $q->whereHas('regions', fn($r) => $r->where('region_id', $currentRegion->id));
            })
            ->orderBy('event_date', 'asc')
            ->limit(5)
            ->get()
            ->map(fn ($event) => [
                'id' => $event->id,
                'title' => $event->title,
                'location' => $event->venue?->name ?? $event->location_name ?? 'Local Venue',
                'month' => $event->event_date->format('M'),
                'day' => $event->event_date->format('d'),
            ]);

        return Inertia::render('day-news/announcements/index', [
            'announcements' => $announcements,
            'featured' => $featured,
            'memorials' => $memorials,
            'upcomingEvents' => $upcomingEvents,
            'filters' => [
                'type' => $type,
                'search' => $search,
            ],
            'currentRegion' => $currentRegion ? [
                'id' => $currentRegion->id,
                'name' => $currentRegion->name,
            ] : null,
        ]);
    }

    private function transformAnnouncement(Announcement $announcement): array
    {
        $eventDate = $announcement->event_date ? \Carbon\Carbon::parse($announcement->event_date) : null;
        $publishedAt = $announcement->published_at ? \Carbon\Carbon::parse($announcement->published_at) : null;

        return [
            'id' => $announcement->id,
            'type' => $announcement->type,
            'title' => $announcement->title,
            'content' => $announcement->content,
            'image' => $announcement->image ? asset('storage/' . $announcement->image) : null,
            'location' => $announcement->location,
            'event_date' => $eventDate?->toDateString(),
            'event_date_formatted' => $eventDate?->format('F j, Y'),
            'published_at' => $publishedAt?->toISOString(),
            'published_at_diff' => $publishedAt?->diffForHumans(),
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
        ];
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
     * Display a single announcement
     */
    public function show(Request $request, Announcement $announcement): Response
    {
        $currentRegion = $request->attributes->get('detected_region');

        // Transform the announcement
        $transformedAnnouncement = $this->transformAnnouncement($announcement);

        // Get related announcements (same type, in same region if possible)
        $related = Announcement::published()
            ->where('id', '!=', $announcement->id)
            ->where('type', $announcement->type)
            ->when($currentRegion, function ($q) use ($currentRegion) {
                $q->forRegion($currentRegion->id);
            })
            ->orderBy('published_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function (Announcement $item) {
                return $this->transformAnnouncement($item);
            });

        // Get memorials for sidebar
        $memorials = Announcement::published()
            ->whereIn('type', ['memorial', 'obituary'])
            ->when($currentRegion, function ($q) use ($currentRegion) {
                $q->forRegion($currentRegion->id);
            })
            ->orderBy('published_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function (Announcement $item) {
                return $this->transformAnnouncement($item);
            });

        // Get upcoming events for sidebar
        $upcomingEvents = Event::where('event_date', '>=', now()->toDateString())
            ->when($currentRegion, function ($q) use ($currentRegion) {
                $q->whereHas('regions', fn($r) => $r->where('region_id', $currentRegion->id));
            })
            ->orderBy('event_date', 'asc')
            ->limit(5)
            ->get()
            ->map(fn ($event) => [
                'id' => $event->id,
                'title' => $event->title,
                'location' => $event->venue?->name ?? $event->location_name ?? 'Local Venue',
                'month' => $event->event_date->format('M'),
                'day' => $event->event_date->format('d'),
            ]);

        // Increment views
        $announcement->increment('views_count');

        return Inertia::render('day-news/announcements/show', [
            'announcement' => $transformedAnnouncement,
            'related' => $related,
            'memorials' => $memorials,
            'upcomingEvents' => $upcomingEvents,
            'currentRegion' => $currentRegion ? [
                'id' => $currentRegion->id,
                'name' => $currentRegion->name,
            ] : null,
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

