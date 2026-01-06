<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Business;
use App\Models\SMBCrmCustomer;
use Illuminate\Database\Seeder;

final class SMBCrmCustomerSeeder extends Seeder
{
    /**
     * Seed legacy SMB CRM customers.
     */
    public function run(): void
    {
        $businesses = Business::all();

        if ($businesses->isEmpty()) {
            $this->command->warn('⚠ No businesses found. Run BusinessSeeder first.');
            return;
        }

        // Create legacy customers using factory
        $targetCount = 100;
        $customers = SMBCrmCustomer::factory($targetCount)->create([
            'business_id' => fn() => $businesses->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} legacy SMB CRM customers");
        $this->command->info("✓ Total legacy customers: " . SMBCrmCustomer::count());
    }
}


