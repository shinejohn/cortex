<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CalendarController extends Controller
{
    // public function __construct()
    // {
    //    $this->authorizeResource(Calendar::class, 'calendar');
    // }

    public function publicIndex(Request $request): Response
    {
        $viewMode = $request->query('view', 'list');
        $selectedDate = $request->query('date') ? new \DateTime($request->query('date')) : new \DateTime();

        $query = Event::published()
            ->upcoming()
            ->with(['venue', 'performer']);

        // Filter by date based on view mode
        if ($viewMode === 'today') {
            $query->whereDate('event_date', $selectedDate->format('Y-m-d'));
        } elseif ($viewMode === '7days') {
            $endDate = clone $selectedDate;
            $endDate->modify('+7 days');
            $query->whereBetween('event_date', [$selectedDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        } elseif ($viewMode === 'month') {
            $startDate = clone $selectedDate;
            $startDate->modify('first day of this month');
            $endDate = clone $selectedDate;
            $endDate->modify('last day of this month');
            $query->whereBetween('event_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        }

        $events = $query->orderBy('event_date', 'asc')->get();

        return Inertia::render('event-city/calendar/index', [
            'events' => $events,
            'selectedDate' => $selectedDate->format('Y-m-d'),
            'viewMode' => $viewMode,
        ]);
    }

    public function index(Request $request): Response
    {
        $query = Calendar::public();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('price_type')) {
            if ($request->price_type === 'free') {
                $query->free();
            } elseif ($request->price_type === 'paid') {
                $query->paid();
            }
        }

        return Inertia::render('event-city/calendars/index', [
            'calendars' => $query->paginate(20),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('event-city/calendars/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|in:music,sports,arts,community', // Example categories
            'is_private' => 'boolean',
        ]);

        $calendar = $request->user()->calendars()->create($validated);

        return redirect()->route('calendars.show', $calendar);
    }

    public function show(Calendar $calendar): Response
    {
        return Inertia::render('event-city/calendars/show', [
            'calendar' => $calendar->load(['events', 'owner']),
            'canEdit' => $calendar->user_id === auth()->id() || $calendar->editors()->where('users.id', auth()->id())->exists(),
        ]);
    }

    public function edit(Calendar $calendar): Response
    {
        return Inertia::render('event-city/calendars/edit', [
            'calendar' => $calendar,
        ]);
    }

    public function update(Request $request, Calendar $calendar): RedirectResponse
    {
        if ($calendar->user_id !== $request->user()->id && !$calendar->editors()->where('users.id', $request->user()->id)->exists()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'boolean',
        ]);

        $calendar->update($validated);

        return redirect()->route('calendars.show', $calendar);
    }

    public function destroy(Calendar $calendar): RedirectResponse
    {
        if ($calendar->user_id !== request()->user()->id) {
            abort(403);
        }
        $calendar->delete();

        return redirect()->route('calendars.index');
    }

    public function follow(Request $request, Calendar $calendar): RedirectResponse
    {
        $calendar->followers()->toggle($request->user()->id);
        return back();
    }

    public function addEvent(Request $request, Calendar $calendar): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id'
        ]);

        $calendar->events()->attach($validated['event_id']);
        return back();
    }

    public function removeEvent(Calendar $calendar, Event $event): RedirectResponse
    {
        $calendar->events()->detach($event->id);
        return back();
    }

    public function addEditor(Request $request, Calendar $calendar): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $validated['email'])->first();
        $calendar->editors()->attach($user->id, ['role' => 'editor']);

        return back();
    }

    public function removeEditor(Calendar $calendar, User $user): RedirectResponse
    {
        $calendar->editors()->detach($user->id);
        return back();
    }
}
