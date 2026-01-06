<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SmbBusiness;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

final class SmbBusinessSeeder extends Seeder
{
    /**
     * Seed SMB businesses (CRM).
     */
    public function run(): void
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->warn('⚠ No tenants found. Run TenantSeeder first.');
            return;
        }

        // Create SMB businesses using factory
        $targetCount = 200;
        $businesses = SmbBusiness::factory($targetCount)->create([
            'tenant_id' => fn() => $tenants->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} SMB businesses");
        $this->command->info("✓ Total SMB businesses: " . SmbBusiness::count());
    }
}


