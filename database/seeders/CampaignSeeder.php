<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

final class CampaignSeeder extends Seeder
{
    /**
     * Seed CRM campaigns.
     */
    public function run(): void
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->warn('⚠ No tenants found. Run TenantSeeder first.');
            return;
        }

        // Create campaigns using factory
        $targetCount = 30;
        $campaigns = Campaign::factory($targetCount)->create([
            'tenant_id' => fn() => $tenants->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} campaigns");
        $this->command->info("✓ Total campaigns: " . Campaign::count());
    }
}


