<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TicketListing;
use App\Models\TicketOrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class TicketMarketplaceService
{
    public function createListing(TicketOrderItem $ticketOrderItem, User $seller, array $data): TicketListing
    {
        // Verify ownership
        if ($ticketOrderItem->ticketOrder->user_id !== $seller->id) {
            throw new \Exception('You do not own this ticket.');
        }

        // Check for existing active listing
        $existingListing = TicketListing::where('ticket_order_item_id', $ticketOrderItem->id)
            ->where('seller_id', $seller->id)
            ->where('status', TicketListing::STATUS_ACTIVE)
            ->first();

        if ($existingListing) {
            throw new \Exception('You already have an active listing for this ticket.');
        }

        return TicketListing::create([
            'ticket_order_item_id' => $ticketOrderItem->id,
            'seller_id' => $seller->id,
            'event_id' => $ticketOrderItem->ticketOrder->event_id,
            'price' => $data['price'],
            'quantity' => $data['quantity'],
            'description' => $data['description'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'status' => TicketListing::STATUS_ACTIVE,
        ]);
    }

    public function purchaseListing(TicketListing $listing, User $buyer, int $quantity): \App\Models\TicketOrder
    {
        if ($listing->status !== TicketListing::STATUS_ACTIVE) {
            throw new \Exception('This listing is no longer available.');
        }

        if ($listing->seller_id === $buyer->id) {
            throw new \Exception('You cannot purchase your own listing.');
        }

        if ($quantity > $listing->quantity) {
            throw new \Exception('Requested quantity exceeds available tickets.');
        }

        return DB::transaction(function () use ($listing, $buyer, $quantity) {
            $totalPrice = $listing->price * $quantity;

            // Create new ticket order for buyer
            $buyerOrder = \App\Models\TicketOrder::create([
                'event_id' => $listing->event_id,
                'user_id' => $buyer->id,
                'status' => 'completed',
                'subtotal' => $totalPrice,
                'fees' => 0,
                'discount' => 0,
                'total' => $totalPrice,
                'payment_status' => 'completed',
                'completed_at' => now(),
            ]);

            // Create ticket order item for buyer
            $buyerOrder->items()->create([
                'ticket_plan_id' => $listing->ticketOrderItem->ticket_plan_id,
                'quantity' => $quantity,
                'unit_price' => $listing->price,
                'total_price' => $totalPrice,
            ]);

            // Update listing
            if ($quantity >= $listing->quantity) {
                $listing->markAsSold($buyer->id);
            } else {
                $listing->decrement('quantity', $quantity);
            }

            return $buyerOrder;
        });
    }

    public function cancelListing(TicketListing $listing): bool
    {
        $listing->update(['status' => TicketListing::STATUS_CANCELLED]);

        return true;
    }
}

