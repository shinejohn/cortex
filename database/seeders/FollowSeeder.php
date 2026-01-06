<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Follow;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

final class FollowSeeder extends Seeder
{
    /**
     * Seed follow relationships.
     */
    public function run(): void
    {
        $users = User::all();
        $tags = Tag::all();
        $events = Event::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');
            return;
        }

        // Users following other users
        foreach ($users->take(30) as $user) {
            $usersToFollow = $users->where('id', '!=', $user->id)->random(min(5, $users->count() - 1));
            foreach ($usersToFollow as $followedUser) {
                Follow::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'followable_type' => User::class,
                        'followable_id' => $followedUser->id,
                    ],
                    Follow::factory()->make([
                        'user_id' => $user->id,
                        'followable_type' => User::class,
                        'followable_id' => $followedUser->id,
                    ])->toArray()
                );
            }
        }

        // Users following tags
        if ($tags->isNotEmpty()) {
            foreach ($users->take(20) as $user) {
                $tagsToFollow = $tags->random(min(3, $tags->count()));
                foreach ($tagsToFollow as $tag) {
                    Follow::firstOrCreate(
                        [
                            'user_id' => $user->id,
                            'followable_type' => Tag::class,
                            'followable_id' => $tag->id,
                        ],
                        Follow::factory()->make([
                            'user_id' => $user->id,
                            'followable_type' => Tag::class,
                            'followable_id' => $tag->id,
                        ])->toArray()
                    );
                }
            }
        }

        // Users following events
        if ($events->isNotEmpty()) {
            foreach ($users->take(25) as $user) {
                $eventsToFollow = $events->random(min(5, $events->count()));
                foreach ($eventsToFollow as $event) {
                    Follow::firstOrCreate(
                        [
                            'user_id' => $user->id,
                            'followable_type' => Event::class,
                            'followable_id' => $event->id,
                        ],
                        Follow::factory()->make([
                            'user_id' => $user->id,
                            'followable_type' => Event::class,
                            'followable_id' => $event->id,
                        ])->toArray()
                    );
                }
            }
        }

        $totalFollows = Follow::count();
        $this->command->info("✓ Total follows: {$totalFollows}");
    }
}


