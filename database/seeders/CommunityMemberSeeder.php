<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CommunityMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $communities = Community::active()->get();
        $users = User::all();

        if ($communities->isEmpty()) {
            $this->command->error('No active communities found. Please run CommunitySeeder first.');

            return;
        }

        if ($users->isEmpty()) {
            $this->command->error('No users found. Please ensure users exist in the database.');

            return;
        }

        foreach ($communities as $community) {
            // Get community creator as admin
            $creator = $users->find($community->created_by);
            if ($creator) {
                CommunityMember::updateOrCreate([
                    'community_id' => $community->id,
                    'user_id' => $creator->id,
                ], [
                    'role' => 'admin',
                    'joined_at' => $community->created_at,
                    'is_active' => true,
                    'last_activity_at' => now(),
                ]);
            }

            // Add random members to each community
            $memberCount = fake()->numberBetween(50, 200);
            $availableUsers = $users->where('id', '!=', $community->created_by)
                ->shuffle()
                ->take($memberCount);

            foreach ($availableUsers as $index => $user) {
                // Make some users moderators (5%)
                $role = match (true) {
                    $index < 2 => 'moderator', // First 2 users are moderators
                    default => 'member',
                };

                CommunityMember::updateOrCreate([
                    'community_id' => $community->id,
                    'user_id' => $user->id,
                ], [
                    'role' => $role,
                    'joined_at' => fake()->dateTimeBetween('-1 year', 'now'),
                    'is_active' => fake()->boolean(85), // 85% active members
                    'last_activity_at' => fake()->dateTimeBetween('-30 days', 'now'),
                ]);
            }

            $actualMemberCount = CommunityMember::where('community_id', $community->id)
                ->where('is_active', true)
                ->count();

            $this->command->info("Created {$actualMemberCount} active members for community: {$community->name}");
        }

        $totalMembers = CommunityMember::where('is_active', true)->count();
        $this->command->info("Total active community members created: {$totalMembers}");
    }
}
