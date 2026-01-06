<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ArticleComment;
use App\Models\ArticleCommentLike;
use App\Models\User;
use Illuminate\Database\Seeder;

final class ArticleCommentLikeSeeder extends Seeder
{
    /**
     * Seed article comment likes.
     */
    public function run(): void
    {
        $comments = ArticleComment::all();
        $users = User::all();

        if ($comments->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No comments or users found. Run ArticleCommentSeeder and UserSeeder first.');
            return;
        }

        foreach ($comments->take(200) as $comment) {
            // Create 0-10 likes per comment
            $likeCount = rand(0, 10);
            $availableUsers = $users->random(min($likeCount, $users->count()));

            foreach ($availableUsers as $user) {
                ArticleCommentLike::firstOrCreate(
                    [
                        'comment_id' => $comment->id,
                        'user_id' => $user->id,
                    ],
                    ArticleCommentLike::factory()->make([
                        'comment_id' => $comment->id,
                        'user_id' => $user->id,
                    ])->toArray()
                );
            }
        }

        $totalLikes = ArticleCommentLike::count();
        $this->command->info("✓ Total article comment likes: {$totalLikes}");
    }
}


