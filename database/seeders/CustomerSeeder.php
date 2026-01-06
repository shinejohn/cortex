<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\SmbBusiness;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

final class CustomerSeeder extends Seeder
{
    /**
     * Seed CRM customers.
     */
    public function run(): void
    {
        $tenants = Tenant::all();
        $smbBusinesses = SmbBusiness::all();

        if ($tenants->isEmpty()) {
            $this->command->warn('⚠ No tenants found. Run TenantSeeder first.');
            return;
        }

        // Create customers using factory
        $targetCount = 500;
        $customers = Customer::factory($targetCount)->create([
            'tenant_id' => fn() => $tenants->random()->id,
            'smb_business_id' => fn() => $smbBusinesses->isNotEmpty() && rand(0, 1) ? $smbBusinesses->random()->id : null,
        ]);

        $this->command->info("✓ Created {$targetCount} customers");
        $this->command->info("✓ Total customers: " . Customer::count());
    }
}


