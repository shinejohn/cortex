<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CommunityThread;
use App\Models\CommunityThreadReply;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

final class CommunityThreadReplySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $threads = CommunityThread::all();
        $users = User::all();

        if ($threads->isEmpty()) {
            $this->command->error('No community threads found. Please run CommunityThreadSeeder first.');

            return;
        }

        if ($users->isEmpty()) {
            $this->command->error('No users found. Please ensure users exist in the database.');

            return;
        }

        foreach ($threads as $thread) {
            // Generate 0-15 replies per thread
            $replyCount = fake()->numberBetween(0, 15);

            for ($i = 0; $i < $replyCount; $i++) {
                $user = $users->random();

                CommunityThreadReply::create([
                    'thread_id' => $thread->id,
                    'user_id' => $user->id,
                    'content' => fake()->paragraphs(fake()->numberBetween(1, 4), true),
                    'is_solution' => $thread->type === 'Question' && fake()->boolean(10), // 10% chance for questions
                    'is_pinned' => $i === 0 && fake()->boolean(20), // 20% chance for first reply to be pinned
                    'is_edited' => fake()->boolean(15), // 15% chance of being edited
                    'created_at' => fake()->dateTimeBetween(Carbon::parse($thread->created_at), Carbon::now()->addDay()),
                ]);

                // Add some nested replies (replies to replies)
                if ($i > 0 && fake()->boolean(30)) { // 30% chance of nested reply
                    $parentReply = CommunityThreadReply::where('thread_id', $thread->id)
                        ->whereNull('reply_to_id')
                        ->inRandomOrder()
                        ->first();

                    if ($parentReply) {
                        CommunityThreadReply::create([
                            'thread_id' => $thread->id,
                            'user_id' => $users->random()->id,
                            'content' => fake()->paragraphs(fake()->numberBetween(1, 2), true),
                            'reply_to_id' => $parentReply->id,
                            'created_at' => fake()->dateTimeBetween(Carbon::parse($parentReply->created_at), Carbon::now()->addDay()),
                        ]);
                    }
                }
            }

            // Update thread's last reply information
            $lastReply = CommunityThreadReply::where('thread_id', $thread->id)
                ->latest()
                ->first();

            if ($lastReply) {
                $thread->update([
                    'last_reply_at' => $lastReply->created_at,
                    'last_reply_by' => $lastReply->user_id,
                ]);
            }

            $actualReplyCount = CommunityThreadReply::where('thread_id', $thread->id)->count();
            $this->command->info("Created {$actualReplyCount} replies for thread: {$thread->title}");
        }

        $totalReplies = CommunityThreadReply::count();
        $this->command->info("Total thread replies created: {$totalReplies}");
    }
}
