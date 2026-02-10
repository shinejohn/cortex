<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Hub;
use App\Models\HubRole;
use Illuminate\Database\Seeder;

final class HubRoleSeeder extends Seeder
{
    /**
     * Seed hub roles.
     */
    public function run(): void
    {
        $hubs = Hub::all();
        if ($hubs->isEmpty()) {
            $this->command->warn('⚠ No hubs found. Run HubSeeder first.');

            return;
        }

        foreach ($hubs as $hub) {
            // Add 2-5 roles per hub
            $roles = [
                ['name' => 'Administrator', 'slug' => 'administrator', 'is_system' => true],
                ['name' => 'Editor', 'slug' => 'editor', 'is_system' => false],
                ['name' => 'Moderator', 'slug' => 'moderator', 'is_system' => false],
            ];

            foreach ($roles as $roleData) {
                HubRole::firstOrCreate(
                    [
                        'hub_id' => $hub->id,
                        'slug' => $roleData['slug'],
                    ],
                    array_merge($roleData, [
                        'permissions' => ['all' => true],
                        'description' => "{$roleData['name']} role for {$hub->name}",
                    ])
                );
            }
        }

        $totalRoles = HubRole::count();
        $this->command->info("✓ Total hub roles: {$totalRoles}");
    }
}
