<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\DayNewsPost;
use App\Models\DayNewsPostPayment;
use App\Models\User;
use Illuminate\Database\Seeder;

final class DayNewsPostPaymentSeeder extends Seeder
{
    /**
     * Seed Day News post payments.
     */
    public function run(): void
    {
        $posts = DayNewsPost::where('type', 'ad')->get();
        $users = User::all();

        if ($posts->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No ad posts or users found. Run DayNewsPostSeeder and UserSeeder first.');
            return;
        }

        // Create payments for 50% of ad posts
        $postsToPay = $posts->random(ceil($posts->count() * 0.5));

        foreach ($postsToPay as $post) {
            DayNewsPostPayment::firstOrCreate(
                ['day_news_post_id' => $post->id],
                DayNewsPostPayment::factory()->make([
                    'day_news_post_id' => $post->id,
                    'user_id' => $post->author_id ?? $users->random()->id,
                ])->toArray()
            );
        }

        $totalPayments = DayNewsPostPayment::count();
        $this->command->info("✓ Total Day News post payments: {$totalPayments}");
    }
}


