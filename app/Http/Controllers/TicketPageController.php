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

        // If event has pricing but no ticket plans, auto-generate basic plans
        if ($event->ticketPlans->isEmpty() && ! $event->is_free && $event->price_min > 0) {
            $this->generateBasicTicketPlans($event);
            $event->load(['ticketPlans' => function ($query) {
                $query->active()->available()->orderBySortOrder();
            }]);
        }

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

    private function generateBasicTicketPlans(Event $event): void
    {
        // Create General Admission ticket plan
        $event->ticketPlans()->create([
            'name' => 'General Admission',
            'description' => 'Standard entry to the event',
            'price' => $event->price_min,
            'max_quantity' => 200,
            'available_quantity' => 200,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        // If there's a price range, create a VIP option
        if ($event->price_max > $event->price_min) {
            $event->ticketPlans()->create([
                'name' => 'VIP Package',
                'description' => 'Premium seating with exclusive access',
                'price' => $event->price_max,
                'max_quantity' => 50,
                'available_quantity' => 50,
                'is_active' => true,
                'sort_order' => 2,
            ]);
        }
    }
}
