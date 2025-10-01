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
    public function index(Request $request): Response
    {
        $query = Event::published()
            ->upcoming()
            ->with(['venue', 'ticketPlans' => function ($query) {
                $query->active()->available();
            }]);

        // Apply search filter
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'ILIKE', "%{$searchTerm}%")
                    ->orWhere('description', 'ILIKE', "%{$searchTerm}%")
                    ->orWhereHas('venue', function ($venueQuery) use ($searchTerm) {
                        $venueQuery->where('name', 'ILIKE', "%{$searchTerm}%");
                    });
            });
        }

        // Apply price filter
        if ($request->filled('min_price')) {
            $query->where('price_min', '>=', $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price_max', '<=', $request->input('max_price'));
        }

        // Apply category filter
        if ($request->filled('categories')) {
            $categories = $request->input('categories');
            $query->whereIn('category', is_array($categories) ? $categories : [$categories]);
        }

        // Apply date filter
        if ($request->filled('date')) {
            $date = $request->input('date');
            $query->whereDate('event_date', $date);
        }

        // Apply free events filter
        if ($request->boolean('free_only')) {
            $query->where('is_free', true);
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'date');
        match ($sortBy) {
            'price_low' => $query->orderBy('price_min', 'asc')->orderBy('event_date', 'asc'),
            'price_high' => $query->orderBy('price_max', 'desc')->orderBy('event_date', 'asc'),
            'popularity' => $query->orderBy('community_rating', 'desc')->orderBy('event_date', 'asc'),
            'recommended' => $query->orderBy('community_rating', 'desc')
                ->orderBy('member_recommendations', 'desc')
                ->orderBy('event_date', 'asc'),
            default => $query->orderBy('event_date', 'asc'),
        };

        $events = $query->paginate(12);

        // Get featured events for empty state (with badges)
        $featuredEvents = Event::published()
            ->upcoming()
            ->with(['venue'])
            ->orderBy('community_rating', 'desc')
            ->take(20)
            ->get()
            ->filter(function ($event) {
                return ! empty($event->badges) && count($event->badges) > 0;
            })
            ->take(6)
            ->values();

        return Inertia::render('tickets/index', [
            'events' => $events,
            'featuredEvents' => $featuredEvents,
            'filters' => [
                'search' => $request->input('search'),
                'min_price' => $request->input('min_price'),
                'max_price' => $request->input('max_price'),
                'categories' => $request->input('categories'),
                'date' => $request->input('date'),
                'free_only' => $request->boolean('free_only'),
            ],
            'sort' => $sortBy,
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

        return Inertia::render('tickets/ticket-selection', [
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

        return Inertia::render('tickets/my-tickets', [
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
