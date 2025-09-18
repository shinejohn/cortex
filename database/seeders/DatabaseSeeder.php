<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMembership;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

final class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user only if not exists
        $testUser = User::firstOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'password' => Hash::make('password'),
        ]);

        // Create or get first workspace
        $workspace = Workspace::firstOrCreate([
            'slug' => 'demo-workspace',
        ], [
            'name' => 'Demo Workspace',
            'owner_id' => $testUser->id,
        ]);

        // Set current workspace for test user
        $testUser->update(['current_workspace_id' => $workspace->id]);

        // Create workspace membership for test user
        WorkspaceMembership::firstOrCreate([
            'workspace_id' => $workspace->id,
            'user_id' => $testUser->id,
        ], [
            'role' => 'owner',
        ]);

        // Create more users if we have less than 6
        $userCount = User::count();
        if ($userCount < 6) {
            $additionalUsers = User::factory(6 - $userCount)->create();

            // Add them to the workspace as members
            foreach ($additionalUsers as $user) {
                $user->update(['current_workspace_id' => $workspace->id]);
                WorkspaceMembership::create([
                    'workspace_id' => $workspace->id,
                    'user_id' => $user->id,
                    'role' => 'member',
                ]);
            }
        }

        // Seed event management data
        $this->call([
            VenueSeeder::class,
            PerformerSeeder::class,
            EventSeeder::class,
            BookingSeeder::class,
        ]);

        // Seed community data
        $this->call([
            CommunitySeeder::class,
            CommunityThreadSeeder::class,
            CommunityMemberSeeder::class,
            CommunityThreadReplySeeder::class,
        ]);
    }
}
