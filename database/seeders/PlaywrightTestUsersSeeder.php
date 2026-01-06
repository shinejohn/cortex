<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMembership;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder for Playwright E2E test users
 * Creates users with known credentials for automated testing
 */
final class PlaywrightTestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create demo workspace
        $workspace = Workspace::firstOrCreate([
            'slug' => 'demo-workspace',
        ], [
            'name' => 'Demo Workspace',
        ]);

        // Test users with different roles
        $testUsers = [
            [
                'name' => 'Test Admin',
                'email' => 'admin@test.com',
                'password' => 'password',
                'role' => 'owner',
            ],
            [
                'name' => 'Test User',
                'email' => 'user@test.com',
                'password' => 'password',
                'role' => 'member',
            ],
            [
                'name' => 'Test Editor',
                'email' => 'editor@test.com',
                'password' => 'password',
                'role' => 'member',
            ],
            [
                'name' => 'Test Viewer',
                'email' => 'viewer@test.com',
                'password' => 'password',
                'role' => 'member',
            ],
        ];

        foreach ($testUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                    'email_verified_at' => now(),
                    'current_workspace_id' => $workspace->id,
                ]
            );

            // Update workspace owner if needed
            if ($userData['role'] === 'owner' && !$workspace->owner_id) {
                $workspace->update(['owner_id' => $user->id]);
            }

            // Create workspace membership
            WorkspaceMembership::firstOrCreate(
                [
                    'workspace_id' => $workspace->id,
                    'user_id' => $user->id,
                ],
                [
                    'role' => $userData['role'],
                ]
            );
        }

        $this->command->info('Playwright test users created successfully!');
        $this->command->info('Users:');
        foreach ($testUsers as $userData) {
            $this->command->info("  - {$userData['email']} / {$userData['password']} ({$userData['role']})");
        }
    }
}

