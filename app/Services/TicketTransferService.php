<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TicketOrderItem;
use App\Models\TicketTransfer;
use App\Models\User;
use Illuminate\Support\Str;

final class TicketTransferService
{
    public function createTransfer(TicketOrderItem $ticketOrderItem, User $fromUser, string $toEmail, array $data = []): TicketTransfer
    {
        // Verify ownership
        if ($ticketOrderItem->ticketOrder->user_id !== $fromUser->id) {
            throw new \Exception('You do not own this ticket.');
        }

        // Check for existing pending transfer
        $existingTransfer = TicketTransfer::where('ticket_order_item_id', $ticketOrderItem->id)
            ->where('from_user_id', $fromUser->id)
            ->pending()
            ->first();

        if ($existingTransfer) {
            throw new \Exception('You already have a pending transfer for this ticket.');
        }

        // Check if recipient is a user
        $recipient = User::where('email', $toEmail)->first();

        return TicketTransfer::create([
            'ticket_order_item_id' => $ticketOrderItem->id,
            'from_user_id' => $fromUser->id,
            'to_user_id' => $recipient?->id,
            'to_email' => $toEmail,
            'status' => TicketTransfer::STATUS_PENDING,
            'transfer_token' => Str::random(64),
            'message' => $data['message'] ?? null,
            'expires_at' => $data['expires_at'] ?? now()->addDays(7),
        ]);
    }

    public function acceptTransfer(TicketTransfer $transfer, User $recipient): bool
    {
        if ($transfer->status !== TicketTransfer::STATUS_PENDING) {
            return false;
        }

        if ($transfer->to_email !== $recipient->email) {
            return false;
        }

        $transfer->update(['to_user_id' => $recipient->id]);
        $transfer->complete();

        return true;
    }

    public function cancelTransfer(TicketTransfer $transfer): bool
    {
        if ($transfer->status !== TicketTransfer::STATUS_PENDING) {
            return false;
        }

        $transfer->update(['status' => TicketTransfer::STATUS_CANCELLED]);

        return true;
    }
}

