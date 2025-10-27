<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreCalendarRequest;
use App\Http\Requests\UpdateCalendarRequest;
use App\Models\Calendar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

final class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Calendar::query()
            ->public()
            ->with(['user'])
            ->withCount(['followers', 'events']);

        // Apply category filter
        if ($request->filled('category') && $request->category !== 'all') {
            $query->byCategory($request->category);
        }

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('about', 'like', "%{$search}%");
            });
        }

        // Apply price filter
        if ($request->filled('price_type')) {
            match ($request->price_type) {
                'free' => $query->free(),
                'paid' => $query->paid(),
                default => null,
            };
        }

        // Apply followers filter
        if ($request->filled('min_followers')) {
            $query->where('followers_count', '>=', $request->integer('min_followers'));
        }
        if ($request->filled('max_followers')) {
            $query->where('followers_count', '<=', $request->integer('max_followers'));
        }

        // Apply update frequency filter
        if ($request->filled('update_frequency') && $request->update_frequency !== 'any') {
            $query->where('update_frequency', $request->update_frequency);
        }

        // Apply sorting
        $sortBy = $request->get('sort', 'trending');
        match ($sortBy) {
            'followers' => $query->orderBy('followers_count', 'desc'),
            'trending' => $query->orderByRaw('(followers_count * 0.7 + events_count * 0.3) DESC'),
            'new' => $query->orderBy('created_at', 'desc'),
            'updated' => $query->orderBy('updated_at', 'desc'),
            default => $query->orderByRaw('(followers_count * 0.7 + events_count * 0.3) DESC'),
        };

        $calendars = $query->paginate(12)->withQueryString();

        // Get trending calendars
        $trendingCalendars = Calendar::query()
            ->public()
            ->with(['user'])
            ->withCount(['followers', 'events'])
            ->orderByRaw('(followers_count * 0.7 + events_count * 0.3) DESC')
            ->limit(6)
            ->get();

        // Get new calendars
        $newCalendars = Calendar::query()
            ->public()
            ->with(['user'])
            ->withCount(['followers', 'events'])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        $filters = [
            'category' => $request->get('category'),
            'search' => $request->get('search'),
            'price_type' => $request->get('price_type'),
            'min_followers' => $request->get('min_followers'),
            'max_followers' => $request->get('max_followers'),
            'update_frequency' => $request->get('update_frequency'),
        ];

        $stats = [
            'total_calendars' => Calendar::public()->count(),
            'total_followers' => Calendar::public()->sum('followers_count'),
            'active_curators' => Calendar::public()->distinct('user_id')->count('user_id'),
        ];

        return Inertia::render('event-city/calendars', [
            'calendars' => $calendars,
            'trendingCalendars' => $trendingCalendars,
            'newCalendars' => $newCalendars,
            'filters' => $filters,
            'stats' => $stats,
            'sort' => $sortBy,
        ]);
    }

    public function create(): Response
    {
        $currentWorkspace = auth()->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'Please select a workspace first.');
        }

        return Inertia::render('event-city/calendars/create', [
            'workspace' => [
                'can_accept_payments' => $currentWorkspace->canAcceptPayments(),
            ],
        ]);
    }

    public function store(StoreCalendarRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('calendars', 'public');
        }

        $calendar = Calendar::create($validated);

        return redirect()->route('calendars.show', $calendar)->with('success', 'Calendar created successfully!');
    }

    public function show(Calendar $calendar): Response
    {
        $calendar->load([
            'user',
            'events' => fn ($q) => $q->with(['venue'])->published()->upcoming()->limit(20),
            'editors',
        ]);

        // Load followers with user details for members tab
        $followers = $calendar->followers()
            ->select(['users.id', 'users.name', 'users.email'])
            ->orderBy('calendar_followers.created_at', 'desc')
            ->limit(50)
            ->get();

        $user = auth()->user();
        $isFollowing = false;
        $canEdit = false;

        if ($user) {
            $isFollowing = $calendar->followers()->where('user_id', $user->id)->exists();

            // Check if user is the owner
            $isOwner = $calendar->user_id === $user->id;

            // Check if user is an editor
            $isEditor = $calendar->editors()->where('user_id', $user->id)->exists();

            $canEdit = $isOwner || $isEditor;
        }

        return Inertia::render('event-city/calendars/show', [
            'calendar' => $calendar,
            'followers' => $followers,
            'isFollowing' => $isFollowing,
            'canEdit' => $canEdit,
        ]);
    }

    public function edit(Calendar $calendar): Response
    {
        $this->authorize('update', $calendar);

        $calendar->load('user.currentWorkspace');

        return Inertia::render('event-city/calendars/edit', [
            'calendar' => $calendar,
            'workspace' => [
                'can_accept_payments' => $calendar->user->currentWorkspace?->canAcceptPayments() ?? false,
            ],
        ]);
    }

    public function update(UpdateCalendarRequest $request, Calendar $calendar): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($calendar->image) {
                Storage::disk('public')->delete($calendar->image);
            }
            $validated['image'] = $request->file('image')->store('calendars', 'public');
        }

        $calendar->update($validated);

        return redirect()->route('calendars.show', $calendar)->with('success', 'Calendar updated successfully!');
    }

    public function destroy(Calendar $calendar): RedirectResponse
    {
        $this->authorize('delete', $calendar);

        if ($calendar->image) {
            Storage::disk('public')->delete($calendar->image);
        }

        $calendar->delete();

        return redirect()->route('calendars.index')->with('success', 'Calendar deleted successfully!');
    }

    public function follow(Request $request, Calendar $calendar): RedirectResponse
    {
        $user = $request->user();

        if ($calendar->followers()->where('user_id', $user->id)->exists()) {
            $calendar->followers()->detach($user->id);
            $calendar->decrement('followers_count');
            $message = 'Unfollowed calendar successfully!';
        } else {
            $calendar->followers()->attach($user->id);
            $calendar->increment('followers_count');
            $message = 'Following calendar successfully!';
        }

        return back()->with('success', $message);
    }

    public function addEvent(Request $request, Calendar $calendar): RedirectResponse
    {
        $this->authorize('update', $calendar);

        $request->validate([
            'event_id' => ['required', 'exists:events,id'],
        ]);

        $existingEvent = $calendar->events()->where('event_id', $request->event_id)->exists();

        if ($existingEvent) {
            return back()->with('error', 'Event is already in this calendar.');
        }

        $maxPosition = $calendar->events()->max('calendar_events.position') ?? -1;

        $calendar->events()->attach($request->event_id, [
            'added_by' => $request->user()->id,
            'position' => $maxPosition + 1,
        ]);

        $calendar->increment('events_count');

        return back()->with('success', 'Event added to calendar successfully!');
    }

    public function removeEvent(Request $request, Calendar $calendar, string $eventId): RedirectResponse
    {
        $this->authorize('update', $calendar);

        $calendar->events()->detach($eventId);
        $calendar->decrement('events_count');

        return back()->with('success', 'Event removed from calendar successfully!');
    }

    public function addEditor(Request $request, Calendar $calendar): RedirectResponse
    {
        $this->authorize('update', $calendar);

        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', 'string', 'in:editor,admin'],
        ]);

        $existingEditor = $calendar->editors()->where('user_id', $request->user_id)->exists();

        if ($existingEditor) {
            return back()->with('error', 'User is already an editor of this calendar.');
        }

        $calendar->editors()->attach($request->user_id, [
            'role' => $request->role,
        ]);

        return back()->with('success', 'Editor added successfully!');
    }

    public function removeEditor(Request $request, Calendar $calendar, string $userId): RedirectResponse
    {
        $this->authorize('update', $calendar);

        $calendar->editors()->detach($userId);

        return back()->with('success', 'Editor removed successfully!');
    }
}
