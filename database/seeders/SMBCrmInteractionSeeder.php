<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SMBCrmCustomer;
use App\Models\SMBCrmInteraction;
use Illuminate\Database\Seeder;

final class SMBCrmInteractionSeeder extends Seeder
{
    /**
     * Seed legacy SMB CRM interactions.
     */
    public function run(): void
    {
        $customers = SMBCrmCustomer::all();

        if ($customers->isEmpty()) {
            $this->command->warn('⚠ No legacy customers found. Run SMBCrmCustomerSeeder first.');
            return;
        }

        foreach ($customers as $customer) {
            // Create 2-8 interactions per customer
            $interactionCount = rand(2, 8);
            SMBCrmInteraction::factory($interactionCount)->create([
                'customer_id' => $customer->id,
            ]);
        }

        $totalInteractions = SMBCrmInteraction::count();
        $this->command->info("✓ Total legacy interactions: {$totalInteractions}");
    }
}


