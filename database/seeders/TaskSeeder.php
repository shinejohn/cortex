<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Task;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

final class TaskSeeder extends Seeder
{
    /**
     * Seed CRM tasks.
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

        // Create tasks using factory
        $targetCount = 500;
        $tasks = Task::factory($targetCount)->create([
            'tenant_id' => fn() => $tenants->random()->id,
            'customer_id' => fn() => $customers->random()->id,
            'user_id' => fn() => $users->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} tasks");
        $this->command->info("✓ Total tasks: " . Task::count());
    }
}


