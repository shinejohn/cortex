<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AccountManager;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

final class AccountManagerSeeder extends Seeder
{
    /**
     * Seed account managers.
     */
    public function run(): void
    {
        $tenants = Tenant::all();
        $users = User::all();

        if ($tenants->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No tenants or users found. Run TenantSeeder and UserSeeder first.');
            return;
        }

        foreach ($tenants as $tenant) {
            // Create 2-5 account managers per tenant
            $managerCount = rand(2, 5);
            $availableUsers = $users->random(min($managerCount, $users->count()));

            foreach ($availableUsers as $user) {
                AccountManager::firstOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'user_id' => $user->id,
                    ],
                    AccountManager::factory()->make([
                        'tenant_id' => $tenant->id,
                        'user_id' => $user->id,
                    ])->toArray()
                );
            }
        }

        // Create additional account managers using factory
        $existingCount = AccountManager::count();
        $targetCount = 20;

        if ($existingCount < $targetCount) {
            $additionalManagers = AccountManager::factory($targetCount - $existingCount)->create([
                'tenant_id' => fn() => $tenants->random()->id,
                'user_id' => fn() => $users->random()->id,
            ]);

            $this->command->info('✓ Created ' . $additionalManagers->count() . ' additional account managers');
        }

        $totalManagers = AccountManager::count();
        $this->command->info("✓ Total account managers: {$totalManagers}");
    }
}


