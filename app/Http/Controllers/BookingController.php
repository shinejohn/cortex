<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Event;
use App\Models\Performer;
use App\Models\User;
use App\Models\Venue;
use App\Notifications\BookingConfirmationNotification;
use App\Services\BookingWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

final class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $query = Booking::where('workspace_id', $currentWorkspace->id)
            ->with(['event', 'venue', 'performer', 'createdBy']);

        // Apply filters
        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('booking_type')) {
            $query->byType($request->booking_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_number', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('contact_email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->forDateRange($request->date_from, $request->date_to ?? $request->date_from);
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        match ($sortBy) {
            'booking_number' => $query->orderBy('booking_number', $sortDirection),
            'status' => $query->orderBy('status', $sortDirection),
            'event_date' => $query->orderBy('event_date', $sortDirection),
            'total_amount' => $query->orderBy('total_amount', $sortDirection),
            default => $query->orderBy('created_at', $sortDirection),
        };

        $bookings = $query->paginate(15)->withQueryString();

        return Inertia::render('event-city/bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['status', 'booking_type', 'search', 'date_from', 'date_to']),
            'sort' => ['sort' => $sortBy, 'direction' => $sortDirection],
        ]);
    }

    public function show(Booking $booking): Response
    {
        $booking->load([
            'event.venue',
            'event.performer',
            'venue',
            'performer.upcomingShows',
            'workspace',
            'createdBy',
        ]);

        $currentStep = $this->workflowService->getCurrentStep($booking);
        $progress = $this->workflowService->getProgressPercentage($booking);
        $financialBreakdown = $this->workflowService->getFinancialBreakdown($booking);
        $canProceed = $this->workflowService->canProceedToNextStep($booking);

        return Inertia::render('event-city/bookings/Show', [
            'booking' => $booking,
            'currentStep' => $currentStep,
            'progress' => $progress,
            'financialBreakdown' => $financialBreakdown,
            'canProceed' => $canProceed,
            'steps' => $this->workflowService->getStepsForBookingType($booking->booking_type),
        ]);
    }

    public function create(Request $request): Response
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $events = Event::where('workspace_id', $currentWorkspace->id)
            ->where('status', 'published')
            ->where('event_date', '>=', now())
            ->with(['venue', 'performer'])
            ->get(['id', 'title', 'event_date', 'venue_id', 'performer_id']);

        $venues = Venue::where('workspace_id', $currentWorkspace->id)
            ->where('status', 'active')
            ->get(['id', 'name', 'address', 'capacity', 'price_per_hour', 'price_per_event', 'price_per_day']);

        $performers = Performer::where('workspace_id', $currentWorkspace->id)
            ->where('status', 'active')
            ->where('available_for_booking', true)
            ->get(['id', 'name', 'genres', 'base_price', 'minimum_booking_hours']);

        $bookingType = $request->get('type', 'event');
        $steps = $this->workflowService->getStepsForBookingType($bookingType);

        return Inertia::render('event-city/bookings/Create', [
            'events' => $events,
            'venues' => $venues,
            'performers' => $performers,
            'bookingType' => $bookingType,
            'steps' => $steps,
            'currentStep' => $steps[0] ?? BookingWorkflowService::STEP_INITIAL_REQUEST,
        ]);
    }

    public function store(Request $request)
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $validated = $request->validate([
            'booking_type' => 'required|in:event,venue,performer',
            'event_id' => 'required_if:booking_type,event|nullable|exists:events,id',
            'venue_id' => 'required_if:booking_type,venue|nullable|exists:venues,id',
            'performer_id' => 'required_if:booking_type,performer|nullable|exists:performers,id',

            // Contact information
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email',
            'contact_phone' => 'nullable|string',
            'contact_company' => 'nullable|string',

            // Event details
            'event_date' => 'required|date|after:now',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'event_type' => 'required|in:private,public,corporate',
            'expected_guests' => 'nullable|integer|min:1',
            'expected_audience' => 'nullable|integer|min:1',

            // Event booking specific
            'ticket_quantity' => 'required_if:booking_type,event|nullable|integer|min:1',
            'ticket_type' => 'required_if:booking_type,event|nullable|string',
            'price_per_ticket' => 'required_if:booking_type,event|nullable|numeric|min:0',

            // Payment
            'total_amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',

            // Additional information
            'notes' => 'nullable|string',
            'special_requests' => 'nullable|array',
            'setup_requirements' => 'nullable|array',
            'catering_requirements' => 'nullable|array',
            'performance_requirements' => 'nullable|array',
            'sound_requirements' => 'nullable|array',
        ]);

        // Use workflow service to create booking draft
        $booking = $this->workflowService->createBookingDraft([
            ...$validated,
            'workspace_id' => $currentWorkspace->id,
            'created_by' => $request->user()->id,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        // Calculate and update quote
        $booking = $this->workflowService->updateQuote($booking);

        // Send booking confirmation email to contact email
        if ($booking->contact_email) {
            $user = User::where('email', $booking->contact_email)->first();
            if ($user) {
                $user->notify(new BookingConfirmationNotification($booking));
            } else {
                // Send via Mail facade if user doesn't exist
                Mail::to($booking->contact_email)->send(new \App\Mail\BookingConfirmationMail($booking));
            }
        }

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking created successfully! Booking number: '.$booking->booking_number);
    }

    public function edit(Booking $booking): Response
    {
        $this->authorize('update', $booking);

        $events = Event::where('workspace_id', $booking->workspace_id)
            ->where('status', 'published')
            ->with(['venue', 'performer'])
            ->get(['id', 'title', 'event_date', 'venue_id', 'performer_id']);

        $venues = Venue::where('workspace_id', $booking->workspace_id)
            ->where('status', 'active')
            ->get(['id', 'name', 'address', 'capacity', 'price_per_hour', 'price_per_event', 'price_per_day']);

        $performers = Performer::where('workspace_id', $booking->workspace_id)
            ->where('status', 'active')
            ->where('available_for_booking', true)
            ->get(['id', 'name', 'genres', 'base_price', 'minimum_booking_hours']);

        return Inertia::render('event-city/bookings/Edit', [
            'booking' => $booking,
            'events' => $events,
            'venues' => $venues,
            'performers' => $performers,
        ]);
    }

    public function update(Request $request, Booking $booking)
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'booking_type' => 'required|in:event,venue,performer',
            'event_id' => 'required_if:booking_type,event|nullable|exists:events,id',
            'venue_id' => 'required_if:booking_type,venue|nullable|exists:venues,id',
            'performer_id' => 'required_if:booking_type,performer|nullable|exists:performers,id',

            // Contact information
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email',
            'contact_phone' => 'nullable|string',
            'contact_company' => 'nullable|string',

            // Event details
            'event_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'event_type' => 'required|in:private,public,corporate',
            'expected_guests' => 'nullable|integer|min:1',
            'expected_audience' => 'nullable|integer|min:1',

            // Event booking specific
            'ticket_quantity' => 'required_if:booking_type,event|nullable|integer|min:1',
            'ticket_type' => 'required_if:booking_type,event|nullable|string',
            'price_per_ticket' => 'required_if:booking_type,event|nullable|numeric|min:0',

            // Payment
            'total_amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'status' => 'required|in:pending,confirmed,cancelled,completed,rejected,refunded',
            'payment_status' => 'required|in:pending,paid,partially_paid,failed,refunded,cancelled',

            // Additional information
            'notes' => 'nullable|string',
            'special_requests' => 'nullable|array',
            'setup_requirements' => 'nullable|array',
            'catering_requirements' => 'nullable|array',
            'performance_requirements' => 'nullable|array',
            'sound_requirements' => 'nullable|array',
        ]);

        $booking->update($validated);

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking updated successfully!');
    }

    public function confirm(Booking $booking)
    {
        $this->authorize('update', $booking);

        $wasPending = $booking->status === 'pending';
        $booking->markAsConfirmed();

        // Send confirmation email when booking is confirmed
        if ($wasPending && $booking->contact_email) {
            $user = User::where('email', $booking->contact_email)->first();
            if ($user) {
                $user->notify(new BookingConfirmationNotification($booking));
            } else {
                // Send via Mail facade if user doesn't exist
                Mail::to($booking->contact_email)->send(new \App\Mail\BookingConfirmationMail($booking));
            }
        }

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking confirmed successfully!');
    }

    public function cancel(Request $request, Booking $booking)
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $booking->markAsCancelled($validated['cancellation_reason']);

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking cancelled successfully.');
    }

    public function destroy(Booking $booking)
    {
        $this->authorize('delete', $booking);

        $booking->delete();

        return redirect()->route('bookings.index')
            ->with('success', 'Booking deleted successfully!');
    }
}
