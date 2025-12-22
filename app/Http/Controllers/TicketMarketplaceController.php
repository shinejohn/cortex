<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\TicketListing;
use App\Models\TicketOrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class TicketMarketplaceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = TicketListing::query()
            ->with(['ticketOrderItem.ticketPlan', 'event.venue', 'seller'])
            ->active();

        if ($request->filled('event_id')) {
            $query->forEvent($request->input('event_id'));
        }

        if ($request->filled('search')) {
            $query->whereHas('event', function ($q) use ($request) {
                $q->where('title', 'ILIKE', "%{$request->input('search')}%");
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        $listings = $query->orderBy('price', 'asc')
            ->paginate(20);

        return Inertia::render('event-city/tickets/marketplace', [
            'listings' => $listings,
            'filters' => [
                'event_id' => $request->input('event_id'),
                'search' => $request->input('search'),
                'min_price' => $request->input('min_price'),
                'max_price' => $request->input('max_price'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $ticketOrders = $user->ticketOrders()
            ->with(['items.ticketPlan', 'event'])
            ->completed()
            ->latest()
            ->get();

        return Inertia::render('event-city/tickets/list-for-sale', [
            'ticketOrders' => $ticketOrders,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ticket_order_item_id' => 'required|uuid|exists:ticket_order_items,id',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $ticketOrderItem = TicketOrderItem::with(['ticketOrder', 'ticketPlan'])->findOrFail($validated['ticket_order_item_id']);

        // Verify ownership
        if ($ticketOrderItem->ticketOrder->user_id !== $request->user()->id) {
            return redirect()->back()->withErrors(['ticket' => 'You do not own this ticket.']);
        }

        // Verify quantity available
        if ($validated['quantity'] > $ticketOrderItem->quantity) {
            return redirect()->back()->withErrors(['quantity' => 'You cannot list more tickets than you own.']);
        }

        // Check for existing active listing
        $existingListing = TicketListing::where('ticket_order_item_id', $ticketOrderItem->id)
            ->where('seller_id', $request->user()->id)
            ->where('status', TicketListing::STATUS_ACTIVE)
            ->first();

        if ($existingListing) {
            return redirect()->back()->withErrors(['listing' => 'You already have an active listing for this ticket.']);
        }

        $listing = TicketListing::create([
            ...$validated,
            'seller_id' => $request->user()->id,
            'event_id' => $ticketOrderItem->ticketOrder->event_id,
            'status' => TicketListing::STATUS_ACTIVE,
        ]);

        return redirect()->route('tickets.marketplace.show', $listing)
            ->with('success', 'Ticket listed for sale successfully.');
    }

    public function show(TicketListing $listing): Response
    {
        $listing->load(['ticketOrderItem.ticketPlan', 'event.venue', 'seller']);

        return Inertia::render('event-city/tickets/listing-show', [
            'listing' => $listing,
        ]);
    }

    public function purchase(Request $request, TicketListing $listing): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:'.$listing->quantity,
        ]);

        if ($listing->status !== TicketListing::STATUS_ACTIVE) {
            return redirect()->back()->withErrors(['listing' => 'This listing is no longer available.']);
        }

        if ($listing->seller_id === $request->user()->id) {
            return redirect()->back()->withErrors(['listing' => 'You cannot purchase your own listing.']);
        }

        return DB::transaction(function () use ($listing, $validated, $request) {
            $totalPrice = $listing->price * $validated['quantity'];

            // Create new ticket order for buyer
            $buyerOrder = \App\Models\TicketOrder::create([
                'event_id' => $listing->event_id,
                'user_id' => $request->user()->id,
                'status' => 'completed',
                'subtotal' => $totalPrice,
                'fees' => 0,
                'discount' => 0,
                'total' => $totalPrice,
                'payment_status' => 'completed',
                'completed_at' => now(),
            ]);

            // Create ticket order item for buyer
            $buyerOrderItem = $buyerOrder->items()->create([
                'ticket_plan_id' => $listing->ticketOrderItem->ticket_plan_id,
                'quantity' => $validated['quantity'],
                'unit_price' => $listing->price,
                'total_price' => $totalPrice,
            ]);

            // Update listing
            if ($validated['quantity'] >= $listing->quantity) {
                $listing->markAsSold($request->user()->id);
            } else {
                $listing->decrement('quantity', $validated['quantity']);
            }

            return redirect()->route('tickets.my-tickets')
                ->with('success', 'Ticket purchased successfully.');
        });
    }

    public function destroy(TicketListing $listing): RedirectResponse
    {
        if ($listing->seller_id !== auth()->id()) {
            abort(403);
        }

        $listing->update(['status' => TicketListing::STATUS_CANCELLED]);

        return redirect()->route('tickets.marketplace.index')
            ->with('success', 'Listing cancelled successfully.');
    }
}
