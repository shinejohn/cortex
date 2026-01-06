<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\TicketGift;
use App\Models\TicketOrderItem;
use App\Models\User;
use Illuminate\Database\Seeder;

final class TicketGiftSeeder extends Seeder
{
    /**
     * Seed ticket gifts.
     */
    public function run(): void
    {
        $ticketOrderItems = TicketOrderItem::all();
        $users = User::all();

        if ($ticketOrderItems->isEmpty() || $users->count() < 2) {
            $this->command->warn('⚠ No ticket order items or insufficient users. Run TicketOrderSeeder and UserSeeder first.');
            return;
        }

        // Create gifts for 5% of ticket order items
        $itemsToGift = $ticketOrderItems->random(ceil($ticketOrderItems->count() * 0.05));

        foreach ($itemsToGift as $item) {
            $gifter = $item->ticketOrder->user;
            $recipient = $users->where('id', '!=', $gifter->id)->random();

            TicketGift::factory()->create([
                'ticket_order_item_id' => $item->id,
                'gifter_id' => $gifter->id,
                'recipient_id' => $recipient->id,
            ]);
        }

        $totalGifts = TicketGift::count();
        $this->command->info("✓ Total ticket gifts: {$totalGifts}");
    }
}


