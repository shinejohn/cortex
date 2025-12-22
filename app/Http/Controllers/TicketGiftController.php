<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\TicketOrderItem;
use App\Models\TicketGift;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class TicketGiftController extends Controller
{
    public function create(Request $request, TicketOrderItem $ticketOrderItem): Response
    {
        // Verify ownership
        if ($ticketOrderItem->ticketOrder->user_id !== $request->user()->id) {
            abort(403);
        }

        return Inertia::render('event-city/tickets/gift', [
            'ticketOrderItem' => $ticketOrderItem->load(['ticketOrder.event', 'ticketPlan']),
        ]);
    }

    public function store(Request $request, TicketOrderItem $ticketOrderItem): RedirectResponse
    {
        // Verify ownership
        if ($ticketOrderItem->ticketOrder->user_id !== $request->user()->id) {
            return redirect()->back()->withErrors(['ticket' => 'You do not own this ticket.']);
        }

        $validated = $request->validate([
            'recipient_email' => 'required|email',
            'recipient_name' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:500',
            'expires_at' => 'nullable|date|after:now',
        ]);

        // Check for existing pending gift
        $existingGift = TicketGift::where('ticket_order_item_id', $ticketOrderItem->id)
            ->where('gifter_id', $request->user()->id)
            ->pending()
            ->first();

        if ($existingGift) {
            return redirect()->back()->withErrors(['gift' => 'You already have a pending gift for this ticket.']);
        }

        // Check if recipient is a user
        $recipient = User::where('email', $validated['recipient_email'])->first();

        $gift = TicketGift::create([
            'ticket_order_item_id' => $ticketOrderItem->id,
            'gifter_id' => $request->user()->id,
            'recipient_email' => $validated['recipient_email'],
            'recipient_name' => $validated['recipient_name'] ?? null,
            'recipient_user_id' => $recipient?->id,
            'status' => TicketGift::STATUS_PENDING,
            'gift_token' => Str::random(64),
            'message' => $validated['message'] ?? null,
            'gifted_at' => now(),
            'expires_at' => $validated['expires_at'] ?? now()->addDays(30),
        ]);

        // TODO: Send email notification

        return redirect()->route('tickets.my-tickets')
            ->with('success', 'Ticket gifted successfully. The recipient will receive an email notification.');
    }

    public function redeem(Request $request, string $token): RedirectResponse
    {
        $gift = TicketGift::where('gift_token', $token)
            ->pending()
            ->firstOrFail();

        if ($gift->expires_at && $gift->expires_at->isPast()) {
            $gift->update(['status' => TicketGift::STATUS_EXPIRED]);
            return redirect()->route('tickets.my-tickets')
                ->withErrors(['gift' => 'This gift has expired.']);
        }

        // Verify email matches if user is logged in
        if ($request->user() && $gift->recipient_email !== $request->user()->email) {
            return redirect()->route('login')
                ->with('error', 'Please log in with the email address that received this gift.');
        }

        // If user is logged in, redeem gift
        if ($request->user()) {
            $gift->redeem($request->user()->id);

            return redirect()->route('tickets.my-tickets')
                ->with('success', 'Ticket gift redeemed successfully.');
        }

        // Otherwise, show redeem page
        return Inertia::render('event-city/tickets/redeem-gift', [
            'gift' => $gift->load(['ticketOrderItem.ticketOrder.event', 'gifter']),
        ]);
    }

    public function complete(Request $request, TicketGift $gift): RedirectResponse
    {
        if ($gift->status !== TicketGift::STATUS_PENDING) {
            return redirect()->back()->withErrors(['gift' => 'This gift is no longer pending.']);
        }

        if ($gift->recipient_email !== $request->user()->email) {
            return redirect()->back()->withErrors(['gift' => 'This gift is not for your email address.']);
        }

        $gift->redeem($request->user()->id);

        return redirect()->route('tickets.my-tickets')
            ->with('success', 'Ticket gift redeemed successfully.');
    }

    public function cancel(TicketGift $gift): RedirectResponse
    {
        if ($gift->gifter_id !== auth()->id()) {
            abort(403);
        }

        if ($gift->status !== TicketGift::STATUS_PENDING) {
            return redirect()->back()->withErrors(['gift' => 'This gift cannot be cancelled.']);
        }

        $gift->update(['status' => TicketGift::STATUS_CANCELLED]);

        return redirect()->back()->with('success', 'Gift cancelled successfully.');
    }
}
