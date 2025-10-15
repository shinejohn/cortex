<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\TicketPlan;
use App\Rules\FreeIfWorkspaceNotApproved;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TicketPlanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $eventId = $request->query('event_id');

        if (! $eventId) {
            return response()->json(['error' => 'Event ID is required'], 400);
        }

        $ticketPlans = TicketPlan::forEvent($eventId)
            ->active()
            ->orderBySortOrder()
            ->get();

        return response()->json($ticketPlans);
    }

    public function store(Request $request): JsonResponse
    {
        $event = Event::with('workspace')->find($request->event_id);

        $rules = [
            'event_id' => 'required|uuid|exists:events,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'max_quantity' => 'required|integer|min:1',
            'available_quantity' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array',
            'sort_order' => 'integer|min:0',
        ];

        // Add workspace approval check for pricing
        if ($event && $event->workspace) {
            $rules['price'] = ['required', 'numeric', 'min:0', new FreeIfWorkspaceNotApproved($event->workspace)];
        }

        $validated = $request->validate($rules);

        $ticketPlan = TicketPlan::create($validated);

        return response()->json($ticketPlan, 201);
    }

    public function show(TicketPlan $ticketPlan): JsonResponse
    {
        return response()->json($ticketPlan->load('event'));
    }

    public function update(Request $request, TicketPlan $ticketPlan): JsonResponse
    {
        $rules = [
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'max_quantity' => 'integer|min:1',
            'available_quantity' => 'integer|min:0',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array',
            'sort_order' => 'integer|min:0',
        ];

        // Add workspace approval check for pricing if price is being updated
        if ($request->has('price') && $ticketPlan->event && $ticketPlan->event->workspace) {
            $rules['price'] = ['numeric', 'min:0', new FreeIfWorkspaceNotApproved($ticketPlan->event->workspace)];
        }

        $validated = $request->validate($rules);

        $ticketPlan->update($validated);

        return response()->json($ticketPlan);
    }

    public function destroy(TicketPlan $ticketPlan): JsonResponse
    {
        $ticketPlan->delete();

        return response()->json(['message' => 'Ticket plan deleted successfully']);
    }

    public function forEvent(Event $event): JsonResponse
    {
        $ticketPlans = $event->ticketPlans()
            ->active()
            ->available()
            ->orderBySortOrder()
            ->get();

        return response()->json($ticketPlans);
    }
}
