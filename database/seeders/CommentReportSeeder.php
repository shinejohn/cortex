<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ArticleComment;
use App\Models\CommentReport;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CommentReportSeeder extends Seeder
{
    /**
     * Seed comment reports.
     */
    public function run(): void
    {
        $comments = ArticleComment::all();
        $users = User::all();

        if ($comments->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No comments or users found. Run ArticleCommentSeeder and UserSeeder first.');
            return;
        }

        // Create reports for 5% of comments
        $commentsToReport = $comments->random(ceil($comments->count() * 0.05));

        foreach ($commentsToReport as $comment) {
            $reporter = $users->where('id', '!=', $comment->user_id)->random();

            CommentReport::firstOrCreate(
                [
                    'comment_id' => $comment->id,
                    'user_id' => $reporter->id,
                ],
                CommentReport::factory()->make([
                    'comment_id' => $comment->id,
                    'user_id' => $reporter->id,
                ])->toArray()
            );
        }

        $totalReports = CommentReport::count();
        $this->command->info("✓ Total comment reports: {$totalReports}");
    }
}


