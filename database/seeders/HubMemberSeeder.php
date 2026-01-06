<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Hub;
use App\Models\HubMember;
use App\Models\User;
use Illuminate\Database\Seeder;

final class HubMemberSeeder extends Seeder
{
    /**
     * Seed hub members.
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
            // Add 5-15 members per hub
            $memberCount = rand(5, 15);
            $availableUsers = $users->where('id', '!=', $hub->created_by)->random(min($memberCount, $users->count() - 1));

            foreach ($availableUsers as $user) {
                HubMember::firstOrCreate(
                    [
                        'hub_id' => $hub->id,
                        'user_id' => $user->id,
                    ],
                    HubMember::factory()->make([
                        'hub_id' => $hub->id,
                        'user_id' => $user->id,
                    ])->toArray()
                );
            }
        }

        $totalMembers = HubMember::count();
        $this->command->info("✓ Total hub members: {$totalMembers}");
    }
}


