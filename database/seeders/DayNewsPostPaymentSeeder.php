<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\DayNewsPost;
use App\Models\DayNewsPostPayment;
use Illuminate\Database\Seeder;

final class DayNewsPostPaymentSeeder extends Seeder
{
    /**
     * Seed Day News post payments.
     */
    public function run(): void
    {
        $posts = DayNewsPost::where('type', 'ad')->get();

        if ($posts->isEmpty()) {
            $this->command->warn('⚠ No ad posts found. Run DayNewsPostSeeder first.');

            return;
        }

        // Create payments for 50% of ad posts
        $postsToPay = $posts->random((int) ceil($posts->count() * 0.5));

        foreach ($postsToPay as $post) {
            DayNewsPostPayment::firstOrCreate(
                ['post_id' => $post->id],
                DayNewsPostPayment::factory()->make([
                    'post_id' => $post->id,
                    'workspace_id' => $post->workspace_id ?? \App\Models\Workspace::factory(),
                ])->toArray()
            );
        }

        $totalPayments = DayNewsPostPayment::count();
        $this->command->info("✓ Total Day News post payments: {$totalPayments}");
    }
}
