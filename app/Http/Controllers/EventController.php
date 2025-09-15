<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Performer;
use App\Models\Venue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class EventController extends Controller
{
    /**
     * Public events page (no authentication required)
     */
    public function publicIndex(Request $request): Response
    {
        // Get current workspace
        $currentWorkspace = null;
        if ($request->user()) {
            $user = $request->user();
            $currentWorkspace = $user->currentWorkspace ?? $user->workspaces->first();
        }

        // Get featured events
        $featuredEvents = Event::published()
            ->upcoming()
            ->with(['venue', 'performer'])
            ->take(6)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'date' => $event->event_date->format('Y-m-d\TH:i:s.000\Z'),
                    'venue' => $event->venue?->name ?? 'TBA',
                    'price' => $event->is_free ? 'Free' : '$' . number_format((float) ($event->price_min ?? 0)),
                    'category' => $event->category,
                    'image' => $event->image,
                ];
            })
            ->toArray();

        // Get upcoming events (next 7 days)
        $upcomingEvents = Event::published()
            ->upcoming()
            ->with(['venue', 'performer'])
            ->whereBetween('event_date', [now(), now()->addDays(7)])
            ->orderBy('event_date')
            ->orderBy('time')
            ->get()
            ->map(function ($event) {
                $eventDateTime = $event->event_date->copy();
                if ($event->time) {
                    $timeParts = explode(':', $event->time);
                    $eventDateTime->setTime((int) $timeParts[0], (int) $timeParts[1]);
                }

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'date' => $eventDateTime->format('Y-m-d\TH:i:s.000\Z'),
                    'venue' => $event->venue?->name ?? 'TBA',
                    'price' => $event->is_free ? 'Free' : '$' . number_format((float) ($event->price_min ?? 0)),
                    'category' => $event->category,
                    'image' => $event->image ?? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
                ];
            })
            ->toArray();

        return Inertia::render('events', [
            'featuredEvents' => $featuredEvents,
            'upcomingEvents' => $upcomingEvents,
        ]);
    }

    public function index(Request $request): Response
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $query = Event::where('workspace_id', $currentWorkspace->id)
            ->with(['venue', 'performer', 'createdBy'])
            ->withCount('bookings');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('is_free')) {
            $query->where('is_free', $request->boolean('is_free'));
        }

        if ($request->filled('venue_id')) {
            $query->where('venue_id', $request->venue_id);
        }

        if ($request->filled('performer_id')) {
            $query->where('performer_id', $request->performer_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->where('event_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('event_date', '<=', $request->date_to);
        }

        // Sorting
        $sortBy = $request->get('sort', 'event_date');
        $sortDirection = $request->get('direction', 'asc');

        match ($sortBy) {
            'title' => $query->orderBy('title', $sortDirection),
            'rating' => $query->orderBy('community_rating', $sortDirection),
            'attendance' => $query->orderBy('member_attendance', $sortDirection),
            'created_at' => $query->orderBy('created_at', $sortDirection),
            default => $query->orderBy('event_date', $sortDirection),
        };

        $events = $query->paginate(12)->withQueryString();

        return Inertia::render('Events/Index', [
            'events' => $events,
            'filters' => $request->only(['status', 'category', 'is_free', 'venue_id', 'performer_id', 'search', 'date_from', 'date_to']),
            'sort' => ['sort' => $sortBy, 'direction' => $sortDirection],
        ]);
    }

    public function show(Event $event): Response
    {
        $event->load([
            'venue',
            'performer.upcomingShows',
            'workspace',
            'createdBy',
            'bookings.createdBy',
        ]);

        return Inertia::render('Events/Show', [
            'event' => $event,
        ]);
    }

    public function featured(Request $request): array
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            return [];
        }

        $events = Event::where('workspace_id', $currentWorkspace->id)
            ->where('status', 'published')
            ->where('event_date', '>=', now())
            ->whereIn('badges', [['Featured']])
            ->orWhere('community_rating', '>=', 4.0)
            ->with(['venue', 'performer'])
            ->orderBy('community_rating', 'desc')
            ->orderBy('member_attendance', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'date' => $event->event_date->toISOString(),
                    'time' => $event->time,
                    'venue' => [
                        'name' => $event->venue?->name ?? 'TBD',
                        'city' => $event->venue?->neighborhood ?? 'Unknown',
                    ],
                    'price' => [
                        'isFree' => $event->is_free,
                        'min' => $event->price_min,
                        'max' => $event->price_max,
                    ],
                    'category' => $event->category,
                    'image' => $event->image ?: '/images/event-placeholder.jpg',
                ];
            });

        return $events->toArray();
    }

    public function upcoming(Request $request): array
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            return [];
        }

        $events = Event::where('workspace_id', $currentWorkspace->id)
            ->where('status', 'published')
            ->where('event_date', '>=', now())
            ->with(['venue', 'performer'])
            ->orderBy('event_date', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'date' => $event->event_date->toISOString(),
                    'time' => $event->time,
                    'venue' => [
                        'name' => $event->venue?->name ?? 'TBD',
                        'city' => $event->venue?->neighborhood ?? 'Unknown',
                    ],
                    'price' => [
                        'isFree' => $event->is_free,
                        'min' => $event->price_min,
                        'max' => $event->price_max,
                    ],
                    'category' => $event->category,
                    'image' => $event->image ?: '/images/event-placeholder.jpg',
                ];
            });

        return $events->toArray();
    }

    public function create(): Response
    {
        $this->authorize('create', Event::class);

        $venues = Venue::where('workspace_id', auth()->user()->currentWorkspace->id)
            ->where('status', 'active')
            ->get(['id', 'name', 'address']);

        $performers = Performer::where('workspace_id', auth()->user()->currentWorkspace->id)
            ->where('status', 'active')
            ->where('available_for_booking', true)
            ->get(['id', 'name', 'genres']);

        return Inertia::render('Events/Create', [
            'venues' => $venues,
            'performers' => $performers,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Event::class);

        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'event_date' => 'required|date|after:now',
            'time' => 'required|string',
            'venue_id' => 'nullable|exists:venues,id',
            'performer_id' => 'nullable|exists:performers,id',
            'category' => 'required|string',
            'subcategories' => 'array',
            'badges' => 'array',
            'is_free' => 'boolean',
            'price_min' => 'required_unless:is_free,true|numeric|min:0',
            'price_max' => 'required_unless:is_free,true|numeric|min:0',
            'image' => 'nullable|url',
            'curator_notes' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if ($validated['is_free']) {
            $validated['price_min'] = 0;
            $validated['price_max'] = 0;
        }

        $event = Event::create([
            ...$validated,
            'workspace_id' => $currentWorkspace->id,
            'created_by' => $request->user()->id,
            'status' => 'draft',
            'community_rating' => 0,
            'member_attendance' => 0,
            'member_recommendations' => 0,
            'discussion_thread_id' => 'thread-' . fake()->randomNumber(6),
        ]);

        return redirect()->route('events.show', $event)
            ->with('success', 'Event created successfully!');
    }

    public function edit(Event $event): Response
    {
        $this->authorize('update', $event);

        $venues = Venue::where('workspace_id', $event->workspace_id)
            ->where('status', 'active')
            ->get(['id', 'name', 'address']);

        $performers = Performer::where('workspace_id', $event->workspace_id)
            ->where('status', 'active')
            ->where('available_for_booking', true)
            ->get(['id', 'name', 'genres']);

        return Inertia::render('Events/Edit', [
            'event' => $event,
            'venues' => $venues,
            'performers' => $performers,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'event_date' => 'required|date',
            'time' => 'required|string',
            'venue_id' => 'nullable|exists:venues,id',
            'performer_id' => 'nullable|exists:performers,id',
            'category' => 'required|string',
            'subcategories' => 'array',
            'badges' => 'array',
            'is_free' => 'boolean',
            'price_min' => 'required_unless:is_free,true|numeric|min:0',
            'price_max' => 'required_unless:is_free,true|numeric|min:0',
            'image' => 'nullable|url',
            'curator_notes' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status' => 'in:draft,published,cancelled,completed',
        ]);

        if ($validated['is_free']) {
            $validated['price_min'] = 0;
            $validated['price_max'] = 0;
        }

        $event->update($validated);

        return redirect()->route('events.show', $event)
            ->with('success', 'Event updated successfully!');
    }

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);

        $event->delete();

        return redirect()->route('events.index')
            ->with('success', 'Event deleted successfully!');
    }
}
