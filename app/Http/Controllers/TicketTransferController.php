<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\TicketOrderItem;
use App\Models\TicketTransfer;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class TicketTransferController extends Controller
{
    public function create(Request $request, TicketOrderItem $ticketOrderItem): Response
    {
        // Verify ownership
        if ($ticketOrderItem->ticketOrder->user_id !== $request->user()->id) {
            abort(403);
        }

        return Inertia::render('event-city/tickets/transfer', [
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
            'to_email' => 'required|email',
            'message' => 'nullable|string|max:500',
            'expires_at' => 'nullable|date|after:now',
        ]);

        // Check for existing pending transfer
        $existingTransfer = TicketTransfer::where('ticket_order_item_id', $ticketOrderItem->id)
            ->where('from_user_id', $request->user()->id)
            ->pending()
            ->first();

        if ($existingTransfer) {
            return redirect()->back()->withErrors(['transfer' => 'You already have a pending transfer for this ticket.']);
        }

        // Check if recipient is a user
        $recipient = User::where('email', $validated['to_email'])->first();

        $transfer = TicketTransfer::create([
            'ticket_order_item_id' => $ticketOrderItem->id,
            'from_user_id' => $request->user()->id,
            'to_user_id' => $recipient?->id,
            'to_email' => $validated['to_email'],
            'status' => TicketTransfer::STATUS_PENDING,
            'transfer_token' => Str::random(64),
            'message' => $validated['message'] ?? null,
            'expires_at' => $validated['expires_at'] ?? now()->addDays(7),
        ]);

        // TODO: Send email notification

        return redirect()->route('tickets.my-tickets')
            ->with('success', 'Transfer request created. The recipient will receive an email notification.');
    }

    public function accept(Request $request, string $token): RedirectResponse
    {
        $transfer = TicketTransfer::where('transfer_token', $token)
            ->pending()
            ->firstOrFail();

        if ($transfer->expires_at && $transfer->expires_at->isPast()) {
            $transfer->update(['status' => TicketTransfer::STATUS_EXPIRED]);
            return redirect()->route('tickets.my-tickets')
                ->withErrors(['transfer' => 'This transfer has expired.']);
        }

        // Verify email matches if user is logged in
        if ($request->user() && $transfer->to_email !== $request->user()->email) {
            return redirect()->route('login')
                ->with('error', 'Please log in with the email address that received this transfer.');
        }

        // If user is logged in, complete transfer
        if ($request->user()) {
            $transfer->update(['to_user_id' => $request->user()->id]);
            $transfer->complete();

            return redirect()->route('tickets.my-tickets')
                ->with('success', 'Ticket transfer completed successfully.');
        }

        // Otherwise, show accept page
        return Inertia::render('event-city/tickets/accept-transfer', [
            'transfer' => $transfer->load(['ticketOrderItem.ticketOrder.event', 'fromUser']),
        ]);
    }

    public function complete(Request $request, TicketTransfer $transfer): RedirectResponse
    {
        if ($transfer->status !== TicketTransfer::STATUS_PENDING) {
            return redirect()->back()->withErrors(['transfer' => 'This transfer is no longer pending.']);
        }

        if ($transfer->to_email !== $request->user()->email) {
            return redirect()->back()->withErrors(['transfer' => 'This transfer is not for your email address.']);
        }

        $transfer->update(['to_user_id' => $request->user()->id]);
        $transfer->complete();

        return redirect()->route('tickets.my-tickets')
            ->with('success', 'Ticket transfer completed successfully.');
    }

    public function cancel(TicketTransfer $transfer): RedirectResponse
    {
        if ($transfer->from_user_id !== auth()->id()) {
            abort(403);
        }

        if ($transfer->status !== TicketTransfer::STATUS_PENDING) {
            return redirect()->back()->withErrors(['transfer' => 'This transfer cannot be cancelled.']);
        }

        $transfer->update(['status' => TicketTransfer::STATUS_CANCELLED]);

        return redirect()->back()->with('success', 'Transfer cancelled successfully.');
    }
}
