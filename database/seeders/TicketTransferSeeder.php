<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\TicketOrderItem;
use App\Models\TicketTransfer;
use App\Models\User;
use Illuminate\Database\Seeder;

final class TicketTransferSeeder extends Seeder
{
    /**
     * Seed ticket transfers.
     */
    public function run(): void
    {
        $ticketOrderItems = TicketOrderItem::all();
        $users = User::all();

        if ($ticketOrderItems->isEmpty() || $users->count() < 2) {
            $this->command->warn('⚠ No ticket order items or insufficient users. Run TicketOrderSeeder and UserSeeder first.');
            return;
        }

        // Create transfers for 10% of ticket order items
        $itemsToTransfer = $ticketOrderItems->random(ceil($ticketOrderItems->count() * 0.1));

        foreach ($itemsToTransfer as $item) {
            $fromUser = $item->ticketOrder->user;
            $toUser = $users->where('id', '!=', $fromUser->id)->random();

            TicketTransfer::factory()->create([
                'ticket_order_item_id' => $item->id,
                'from_user_id' => $fromUser->id,
                'to_user_id' => $toUser->id,
            ]);
        }

        $totalTransfers = TicketTransfer::count();
        $this->command->info("✓ Total ticket transfers: {$totalTransfers}");
    }
}


