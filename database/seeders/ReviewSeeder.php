<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Performer;
use App\Models\Review;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\Seeder;

final class ReviewSeeder extends Seeder
{
    /**
     * Seed reviews (polymorphic).
     */
    public function run(): void
    {
        $users = User::all();
        $venues = Venue::all();
        $performers = Performer::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');
            return;
        }

        // Create reviews for venues
        if ($venues->isNotEmpty()) {
            foreach ($venues->take(30) as $venue) {
                $reviewCount = rand(3, 10);
                $availableUsers = $users->random(min($reviewCount, $users->count()));

                foreach ($availableUsers as $user) {
                    Review::firstOrCreate(
                        [
                            'user_id' => $user->id,
                            'reviewable_type' => Venue::class,
                            'reviewable_id' => $venue->id,
                        ],
                        Review::factory()->make([
                            'user_id' => $user->id,
                            'reviewable_type' => Venue::class,
                            'reviewable_id' => $venue->id,
                        ])->toArray()
                    );
                }
            }
        }

        // Create reviews for performers
        if ($performers->isNotEmpty()) {
            foreach ($performers->take(20) as $performer) {
                $reviewCount = rand(2, 8);
                $availableUsers = $users->random(min($reviewCount, $users->count()));

                foreach ($availableUsers as $user) {
                    Review::firstOrCreate(
                        [
                            'user_id' => $user->id,
                            'reviewable_type' => Performer::class,
                            'reviewable_id' => $performer->id,
                        ],
                        Review::factory()->make([
                            'user_id' => $user->id,
                            'reviewable_type' => Performer::class,
                            'reviewable_id' => $performer->id,
                        ])->toArray()
                    );
                }
            }
        }

        $totalReviews = Review::count();
        $this->command->info("✓ Total reviews: {$totalReviews}");
    }
}


