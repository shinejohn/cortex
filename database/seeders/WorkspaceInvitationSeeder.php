<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Database\Seeder;

final class WorkspaceInvitationSeeder extends Seeder
{
    /**
     * Seed workspace invitations.
     */
    public function run(): void
    {
        $workspaces = Workspace::all();
        $users = User::all();

        if ($workspaces->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No workspaces or users found. Run WorkspaceSeeder and UserSeeder first.');
            return;
        }

        foreach ($workspaces as $workspace) {
            // Create 2-5 invitations per workspace
            $invitationCount = rand(2, 5);
            $availableUsers = $users->where('id', '!=', $workspace->owner_id)->random(min($invitationCount, $users->count() - 1));

            foreach ($availableUsers as $user) {
                WorkspaceInvitation::firstOrCreate(
                    [
                        'workspace_id' => $workspace->id,
                        'email' => $user->email,
                    ],
                    WorkspaceInvitation::factory()->make([
                        'workspace_id' => $workspace->id,
                        'email' => $user->email,
                        'invited_by' => $workspace->owner_id,
                    ])->toArray()
                );
            }
        }

        $totalInvitations = WorkspaceInvitation::count();
        $this->command->info("✓ Total workspace invitations: {$totalInvitations}");
    }
}


