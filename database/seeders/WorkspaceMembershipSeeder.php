<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMembership;
use Illuminate\Database\Seeder;

final class WorkspaceMembershipSeeder extends Seeder
{
    /**
     * Seed workspace memberships.
     */
    public function run(): void
    {
        $workspaces = Workspace::all();
        $users = User::all();

        if ($workspaces->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No workspaces or users found. Run WorkspaceSeeder and UserSeeder first.');
            return;
        }

        $roles = ['owner', 'admin', 'member', 'viewer'];

        foreach ($workspaces as $workspace) {
            // Ensure owner is a member
            WorkspaceMembership::firstOrCreate(
                [
                    'workspace_id' => $workspace->id,
                    'user_id' => $workspace->owner_id,
                ],
                [
                    'role' => 'owner',
                ]
            );

            // Add 3-8 additional members to each workspace
            $memberCount = rand(3, 8);
            $availableUsers = $users->where('id', '!=', $workspace->owner_id)->random(min($memberCount, $users->count() - 1));

            foreach ($availableUsers as $user) {
                WorkspaceMembership::firstOrCreate(
                    [
                        'workspace_id' => $workspace->id,
                        'user_id' => $user->id,
                    ],
                    [
                        'role' => $roles[array_rand($roles)],
                    ]
                );
            }
        }

        $totalMemberships = WorkspaceMembership::count();
        $this->command->info("✓ Total workspace memberships: {$totalMemberships}");
    }
}


