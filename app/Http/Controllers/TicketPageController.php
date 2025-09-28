<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\TicketOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TicketPageController extends Controller
{
    public function index(): Response
    {
        $upcomingEvents = Event::published()
            ->upcoming()
            ->with(['venue'])
            ->orderBy('event_date')
            ->take(6)
            ->get();

        return Inertia::render('tickets', [
            'upcomingEvents' => $upcomingEvents,
        ]);
    }

    public function selection(Event $event): Response
    {
        $event->load(['venue', 'ticketPlans' => function ($query) {
            $query->active()->available()->orderBySortOrder();
        }]);

        return Inertia::render('ticket-selection', [
            'event' => $event,
            'ticketPlans' => $event->ticketPlans,
        ]);
    }

    public function myTickets(Request $request): Response
    {
        $orders = TicketOrder::forUser($request->user()->id)
            ->with(['event.venue', 'items.ticketPlan'])
            ->latest()
            ->get();

        return Inertia::render('my-tickets', [
            'orders' => $orders,
        ]);
    }
}
