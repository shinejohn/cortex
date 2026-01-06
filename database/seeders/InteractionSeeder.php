<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Interaction;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

final class InteractionSeeder extends Seeder
{
    /**
     * Seed CRM interactions.
     */
    public function run(): void
    {
        $tenants = Tenant::all();
        $customers = Customer::all();
        $users = User::all();

        if ($tenants->isEmpty() || $customers->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No tenants, customers, or users found. Run TenantSeeder, CustomerSeeder, and UserSeeder first.');
            return;
        }

        // Create interactions using factory
        $targetCount = 500;
        $interactions = Interaction::factory($targetCount)->create([
            'tenant_id' => fn() => $tenants->random()->id,
            'customer_id' => fn() => $customers->random()->id,
            'user_id' => fn() => $users->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} interactions");
        $this->command->info("✓ Total interactions: " . Interaction::count());
    }
}


