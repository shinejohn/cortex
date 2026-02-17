<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CheckIn;
use App\Models\Event;
use App\Models\TicketOrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class TicketCheckInService
{
    public function checkInByTicketCode(string $ticketCode, User $staffUser): array
    {
        $ticketCode = $this->extractTicketCodeFromUrl($ticketCode);

        return DB::transaction(function () use ($ticketCode, $staffUser) {
            $ticketItem = TicketOrderItem::where('ticket_code', $ticketCode)
                ->lockForUpdate()
                ->with(['ticketOrder.event', 'ticketPlan'])
                ->first();

            if (! $ticketItem) {
                return ['success' => false, 'error' => 'Ticket not found', 'ticket' => null];
            }

            if ($ticketItem->checked_in_at !== null) {
                return ['success' => false, 'error' => 'Ticket already used', 'ticket' => $ticketItem];
            }

            $ticketItem->update([
                'checked_in_at' => now(),
                'checked_in_by' => $staffUser->id,
            ]);

            $order = $ticketItem->ticketOrder;
            CheckIn::create([
                'event_id' => $order->event_id,
                'user_id' => $order->user_id,
                'checked_in_at' => now(),
                'is_public' => true,
            ]);

            Event::where('id', $order->event_id)->increment('member_attendance');

            return [
                'success' => true,
                'ticket' => $ticketItem->fresh()->load(['ticketOrder.event', 'ticketPlan']),
            ];
        });
    }

    private function extractTicketCodeFromUrl(string $input): string
    {
        if (str_contains($input, '/tickets/verify/')) {
            $parts = explode('/tickets/verify/', $input);

            return mb_trim(end($parts));
        }

        return mb_trim($input);
    }
}
