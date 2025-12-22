<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\CheckIn;
use App\Models\Event;
use App\Notifications\CheckInConfirmationNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CheckInController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CheckIn::query()
            ->with(['event.venue', 'user'])
            ->latest('checked_in_at');

        if ($request->filled('event_id')) {
            $query->forEvent($request->input('event_id'));
        }

        if ($request->filled('user_id')) {
            $query->forUser($request->input('user_id'));
        }

        if ($request->boolean('public_only')) {
            $query->public();
        }

        $checkIns = $query->paginate(20);

        return Inertia::render('event-city/check-ins/index', [
            'checkIns' => $checkIns,
            'filters' => [
                'event_id' => $request->input('event_id'),
                'user_id' => $request->input('user_id'),
                'public_only' => $request->boolean('public_only'),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => 'required|uuid|exists:events,id',
            'location' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        $event = Event::findOrFail($validated['event_id']);

        // Check if user already checked in
        $existingCheckIn = CheckIn::where('event_id', $event->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingCheckIn) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'You have already checked in to this event.',
                    'check_in' => $existingCheckIn,
                ], 409);
            }

            return redirect()->back()->withErrors(['check_in' => 'You have already checked in to this event.']);
        }

        $checkIn = CheckIn::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'checked_in_at' => now(),
        ]);

        // Update event check-in count
        $event->increment('member_attendance');

        // Send check-in confirmation email
        $request->user()->notify(new CheckInConfirmationNotification($checkIn));

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Checked in successfully.',
                'check_in' => $checkIn->load(['event', 'user']),
            ], 201);
        }

        return redirect()->back()->with('success', 'Checked in successfully.');
    }

    public function show(CheckIn $checkIn): Response
    {
        $checkIn->load(['event.venue', 'user']);

        return Inertia::render('event-city/check-ins/show', [
            'checkIn' => $checkIn,
        ]);
    }

    public function destroy(CheckIn $checkIn): RedirectResponse
    {
        $this->authorize('delete', $checkIn);

        $event = $checkIn->event;
        $checkIn->delete();

        // Update event check-in count
        if ($event) {
            $event->decrement('member_attendance');
        }

        return redirect()->back()->with('success', 'Check-in removed successfully.');
    }

    public function forEvent(Event $event): JsonResponse
    {
        $checkIns = CheckIn::forEvent($event->id)
            ->with('user')
            ->public()
            ->recent(24)
            ->latest('checked_in_at')
            ->get();

        return response()->json($checkIns);
    }
}
