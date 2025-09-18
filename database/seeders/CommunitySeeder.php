<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Community;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class CommunitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first workspace and user for seeding
        $workspace = Workspace::first();
        $user = User::first();

        if (! $workspace || ! $user) {
            $this->command->warn('No workspace or user found. Skipping community seeding.');

            return;
        }

        // Create the specific communities from the user's original code
        $jazzCommunity = Community::factory()
            ->jazzLovers()
            ->active()
            ->create([
                'workspace_id' => $workspace->id,
                'created_by' => $user->id,
            ]);

        $gardeningCommunity = Community::factory()
            ->urbanGardeners()
            ->active()
            ->create([
                'workspace_id' => $workspace->id,
                'created_by' => $user->id,
            ]);

        // Create additional specific communities
        Community::factory()
            ->techEntrepreneurs()
            ->active()
            ->create([
                'workspace_id' => $workspace->id,
                'created_by' => $user->id,
            ]);

        Community::factory()
            ->fitnessWellness()
            ->active()
            ->create([
                'workspace_id' => $workspace->id,
                'created_by' => $user->id,
            ]);

        Community::factory()
            ->bookClub()
            ->active()
            ->create([
                'workspace_id' => $workspace->id,
                'created_by' => $user->id,
            ]);

        $this->command->info('Communities seeded successfully.');
    }
}
