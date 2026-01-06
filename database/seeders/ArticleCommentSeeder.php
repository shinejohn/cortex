<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ArticleComment;
use App\Models\DayNewsPost;
use App\Models\User;
use Illuminate\Database\Seeder;

final class ArticleCommentSeeder extends Seeder
{
    /**
     * Seed article comments.
     */
    public function run(): void
    {
        $posts = DayNewsPost::all();
        $users = User::all();

        if ($posts->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No posts or users found. Run DayNewsPostSeeder and UserSeeder first.');
            return;
        }

        foreach ($posts as $post) {
            // Create 5-20 comments per post
            $commentCount = rand(5, 20);
            $availableUsers = $users->random(min($commentCount, $users->count()));

            foreach ($availableUsers as $user) {
                // Create top-level comment
                $comment = ArticleComment::factory()->create([
                    'article_id' => $post->id,
                    'user_id' => $user->id,
                    'parent_id' => null,
                ]);

                // Create 0-3 replies to this comment
                $replyCount = rand(0, 3);
                $replyUsers = $users->where('id', '!=', $user->id)->random(min($replyCount, $users->count() - 1));

                foreach ($replyUsers as $replyUser) {
                    ArticleComment::factory()->create([
                        'article_id' => $post->id,
                        'user_id' => $replyUser->id,
                        'parent_id' => $comment->id,
                    ]);
                }
            }
        }

        $totalComments = ArticleComment::count();
        $this->command->info("✓ Total article comments: {$totalComments}");
    }
}


