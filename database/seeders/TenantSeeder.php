<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

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
                'slug' => 'acme-corp',
                'subdomain' => 'acme',
                'domain' => 'acme.example.com',
                'is_active' => true,
            ],
            [
                'name' => 'Tech Solutions Inc',
                'slug' => 'tech-solutions',
                'subdomain' => 'tech',
                'domain' => 'tech.example.com',
                'is_active' => true,
            ],
            [
                'name' => 'Global Enterprises',
                'slug' => 'global-enterprises',
                'subdomain' => 'global',
                'domain' => 'global.example.com',
                'is_active' => true,
            ],
            [
                'name' => 'Startup Hub',
                'slug' => 'startup-hub',
                'subdomain' => 'startup',
                'domain' => 'startup.example.com',
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise Solutions',
                'slug' => 'enterprise-solutions',
                'subdomain' => 'enterprise',
                'domain' => 'enterprise.example.com',
                'is_active' => true,
            ],
        ];

        foreach ($tenants as $tenantData) {
            Tenant::firstOrCreate(
                ['slug' => $tenantData['slug']],
                $tenantData
            );
        }

        // Create additional tenants using factory
        $existingCount = Tenant::count();
        $targetCount = 5;

        if ($existingCount < $targetCount) {
            $additionalTenants = Tenant::factory($targetCount - $existingCount)->create();
            $this->command->info('✓ Created ' . $additionalTenants->count() . ' additional tenants');
        }

        $totalTenants = Tenant::count();
        $this->command->info("✓ Total tenants: {$totalTenants}");
    }
}


