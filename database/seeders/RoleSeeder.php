<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

final class RoleSeeder extends Seeder
{
    /**
     * Seed default roles.
     */
    public function run(): void
    {
        $roles = [
            'owner',
            'admin',
            'member',
            'viewer',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(
                ['name' => $roleName],
                ['name' => $roleName]
            );
        }

        $this->command->info('✓ Created ' . count($roles) . ' roles');
    }
}


