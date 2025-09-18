<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CommunityThread;
use App\Models\CommunityThreadView;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

final class CommunityThreadViewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $threads = CommunityThread::all();
        $users = User::all();

        if ($threads->isEmpty()) {
            $this->command->warn('No community threads found. Skipping views seeding.');

            return;
        }

        foreach ($threads as $thread) {
            $viewers = collect();

            // Add a random subset of logged-in users
            if ($users->isNotEmpty()) {
                $loggedInViewersCount = fake()->numberBetween(0, min(20, $users->count()));
                $viewers = $viewers->concat($users->random($loggedInViewersCount)->map(fn ($user) => [
                    'user_id' => $user->id,
                    'session_id' => null,
                ]));
            }

            // Add a few guest sessions
            $guestViewersCount = fake()->numberBetween(5, 15);
            for ($i = 0; $i < $guestViewersCount; $i++) {
                $viewers->push([
                    'user_id' => null,
                    'session_id' => fake()->uuid(),
                ]);
            }

            // Shuffle to mix logged-in and guest views
            $viewers = $viewers->shuffle();

            foreach ($viewers as $viewer) {
                CommunityThreadView::factory()->create([
                    'thread_id' => $thread->id,
                    'user_id' => $viewer['user_id'],
                    'session_id' => $viewer['session_id'],
                    'viewed_at' => fake()->dateTimeBetween(Carbon::parse($thread->created_at), Carbon::now()->addDay()),
                ]);
            }
            $this->command->info("Created {$viewers->count()} views for thread: {$thread->title}");
        }

        $totalViews = CommunityThreadView::count();
        $this->command->info("Total thread views created: {$totalViews}");
    }
}
