<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TicketOrderItem;
use App\Models\TicketGift;
use App\Models\User;
use Illuminate\Support\Str;

final class TicketGiftService
{
    public function createGift(TicketOrderItem $ticketOrderItem, User $gifter, string $recipientEmail, array $data = []): TicketGift
    {
        // Verify ownership
        if ($ticketOrderItem->ticketOrder->user_id !== $gifter->id) {
            throw new \Exception('You do not own this ticket.');
        }

        // Check for existing pending gift
        $existingGift = TicketGift::where('ticket_order_item_id', $ticketOrderItem->id)
            ->where('gifter_id', $gifter->id)
            ->pending()
            ->first();

        if ($existingGift) {
            throw new \Exception('You already have a pending gift for this ticket.');
        }

        // Check if recipient is a user
        $recipient = User::where('email', $recipientEmail)->first();

        return TicketGift::create([
            'ticket_order_item_id' => $ticketOrderItem->id,
            'gifter_id' => $gifter->id,
            'recipient_email' => $recipientEmail,
            'recipient_name' => $data['recipient_name'] ?? null,
            'recipient_user_id' => $recipient?->id,
            'status' => TicketGift::STATUS_PENDING,
            'gift_token' => Str::random(64),
            'message' => $data['message'] ?? null,
            'gifted_at' => now(),
            'expires_at' => $data['expires_at'] ?? now()->addDays(30),
        ]);
    }

    public function redeemGift(TicketGift $gift, User $recipient): bool
    {
        if ($gift->status !== TicketGift::STATUS_PENDING) {
            return false;
        }

        if ($gift->recipient_email !== $recipient->email) {
            return false;
        }

        $gift->redeem($recipient->id);

        return true;
    }

    public function cancelGift(TicketGift $gift): bool
    {
        if ($gift->status !== TicketGift::STATUS_PENDING) {
            return false;
        }

        $gift->update(['status' => TicketGift::STATUS_CANCELLED]);

        return true;
    }
}

