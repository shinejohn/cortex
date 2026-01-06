<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\TicketListing;
use App\Models\TicketOrderItem;
use App\Models\User;
use Illuminate\Database\Seeder;

final class TicketListingSeeder extends Seeder
{
    /**
     * Seed ticket listings (marketplace).
     */
    public function run(): void
    {
        $ticketOrderItems = TicketOrderItem::all();
        $users = User::all();

        if ($ticketOrderItems->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No ticket order items or users found. Run TicketOrderSeeder and UserSeeder first.');
            return;
        }

        // Create listings for 20% of ticket order items
        $itemsToSell = $ticketOrderItems->random(ceil($ticketOrderItems->count() * 0.2));

        foreach ($itemsToSell as $item) {
            TicketListing::factory()->create([
                'ticket_order_item_id' => $item->id,
                'seller_id' => $item->ticketOrder->user_id,
            ]);
        }

        $totalListings = TicketListing::count();
        $this->command->info("✓ Total ticket listings: {$totalListings}");
    }
}


