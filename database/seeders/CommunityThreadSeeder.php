<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Community;
use App\Models\CommunityThread;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CommunityThreadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $communities = Community::active()->get();
        $users = User::all();

        if ($communities->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No communities or users found. Skipping thread seeding.');

            return;
        }

        foreach ($communities as $community) {
            // Create 15-25 threads per community
            $threadCount = fake()->numberBetween(15, 25);

            for ($i = 0; $i < $threadCount; $i++) {
                $author = $users->random();

                // Determine thread characteristics
                $isPinned = $i < 2; // First 2 threads are pinned
                $isLocked = $i === 3; // 4th thread is locked

                $thread = CommunityThread::factory()->create([
                    'community_id' => $community->id,
                    'author_id' => $author->id,
                    'is_pinned' => $isPinned,
                    'is_locked' => $isLocked,
                ]);
            }

            $this->command->info("Created {$threadCount} threads for community: {$community->name}");
        }

        // Sort threads by pinned status and creation date
        $totalThreads = CommunityThread::count();
        $this->command->info("Total threads created: {$totalThreads}");
    }
}
