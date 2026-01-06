<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Hub;
use App\Models\HubRole;
use App\Models\User;
use Illuminate\Database\Seeder;

final class HubRoleSeeder extends Seeder
{
    /**
     * Seed hub roles.
     */
    public function run(): void
    {
        $hubs = Hub::all();
        $users = User::all();

        if ($hubs->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No hubs or users found. Run HubSeeder and UserSeeder first.');
            return;
        }

        foreach ($hubs as $hub) {
            // Add 2-5 roles per hub
            $roleCount = rand(2, 5);
            $availableUsers = $users->where('id', '!=', $hub->created_by)->random(min($roleCount, $users->count() - 1));

            foreach ($availableUsers as $user) {
                HubRole::firstOrCreate(
                    [
                        'hub_id' => $hub->id,
                        'user_id' => $user->id,
                    ],
                    HubRole::factory()->make([
                        'hub_id' => $hub->id,
                        'user_id' => $user->id,
                    ])->toArray()
                );
            }
        }

        $totalRoles = HubRole::count();
        $this->command->info("✓ Total hub roles: {$totalRoles}");
    }
}


