<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CommunityThreadReply;
use App\Models\CommunityThreadReplyLike;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CommunityThreadReplyLikeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $replies = CommunityThreadReply::all();
        $users = User::all();

        if ($replies->isEmpty()) {
            $this->command->warn('No community thread replies found. Skipping likes seeding.');

            return;
        }

        if ($users->isEmpty()) {
            $this->command->error('No users found. Please ensure users exist in the database.');

            return;
        }

        foreach ($replies as $reply) {
            // Each reply can have 0 to max_users / 2 likes
            $likesCount = fake()->numberBetween(0, min(20, $users->count() / 2));

            $likedUsers = $users->random($likesCount);

            foreach ($likedUsers as $user) {
                CommunityThreadReplyLike::factory()->create([
                    'reply_id' => $reply->id,
                    'user_id' => $user->id,
                ]);
            }
            $this->command->info("Created {$likesCount} likes for reply ID: {$reply->id}");
        }

        $totalLikes = CommunityThreadReplyLike::count();
        $this->command->info("Total thread reply likes created: {$totalLikes}");
    }
}
