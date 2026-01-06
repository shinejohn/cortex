<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Deal;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

final class DealSeeder extends Seeder
{
    /**
     * Seed CRM deals.
     */
    public function run(): void
    {
        $tenants = Tenant::all();
        $customers = Customer::all();

        if ($tenants->isEmpty() || $customers->isEmpty()) {
            $this->command->warn('⚠ No tenants or customers found. Run TenantSeeder and CustomerSeeder first.');
            return;
        }

        // Create deals using factory
        $targetCount = 200;
        $deals = Deal::factory($targetCount)->create([
            'tenant_id' => fn() => $tenants->random()->id,
            'customer_id' => fn() => $customers->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} deals");
        $this->command->info("✓ Total deals: " . Deal::count());
    }
}


