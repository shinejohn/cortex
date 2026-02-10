<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;

final class TenantSeeder extends Seeder
{
    /**
     * Seed CRM tenants.
     */
    public function run(): void
    {
        $tenants = [
            [
                'name' => 'Acme Corporation',
                'subdomain' => 'acme',
                'domain' => 'acme.example.com',
                'email' => 'contact@acme.example.com',
                'is_active' => true,
            ],
            [
                'name' => 'Tech Solutions Inc',
                'subdomain' => 'tech',
                'domain' => 'tech.example.com',
                'email' => 'support@tech.example.com',
                'is_active' => true,
            ],
            [
                'name' => 'Global Enterprises',
                'subdomain' => 'global',
                'domain' => 'global.example.com',
                'email' => 'info@global.example.com',
                'is_active' => true,
            ],
            [
                'name' => 'Startup Hub',
                'subdomain' => 'startup',
                'domain' => 'startup.example.com',
                'email' => 'hello@startup.example.com',
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise Solutions',
                'subdomain' => 'enterprise',
                'domain' => 'enterprise.example.com',
                'email' => 'sales@enterprise.example.com',
                'is_active' => true,
            ],
        ];

        foreach ($tenants as $tenantData) {
            Tenant::firstOrCreate(
                ['subdomain' => $tenantData['subdomain']],
                $tenantData
            );
        }

        // Create additional tenants using factory
        $existingCount = Tenant::count();
        $targetCount = 5;

        if ($existingCount < $targetCount) {
            $additionalTenants = Tenant::factory($targetCount - $existingCount)->create();
            $this->command->info('✓ Created '.$additionalTenants->count().' additional tenants');
        }

        $totalTenants = Tenant::count();
        $this->command->info("✓ Total tenants: {$totalTenants}");
    }
}
