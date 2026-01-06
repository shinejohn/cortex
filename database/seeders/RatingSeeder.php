<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Performer;
use App\Models\Rating;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\Seeder;

final class RatingSeeder extends Seeder
{
    /**
     * Seed ratings (polymorphic).
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

        // Create ratings for venues
        if ($venues->isNotEmpty()) {
            foreach ($venues->take(40) as $venue) {
                $ratingCount = rand(5, 15);
                $availableUsers = $users->random(min($ratingCount, $users->count()));

                foreach ($availableUsers as $user) {
                    Rating::firstOrCreate(
                        [
                            'user_id' => $user->id,
                            'ratable_type' => Venue::class,
                            'ratable_id' => $venue->id,
                        ],
                        Rating::factory()->make([
                            'user_id' => $user->id,
                            'ratable_type' => Venue::class,
                            'ratable_id' => $venue->id,
                        ])->toArray()
                    );
                }
            }
        }

        // Create ratings for performers
        if ($performers->isNotEmpty()) {
            foreach ($performers->take(30) as $performer) {
                $ratingCount = rand(3, 10);
                $availableUsers = $users->random(min($ratingCount, $users->count()));

                foreach ($availableUsers as $user) {
                    Rating::firstOrCreate(
                        [
                            'user_id' => $user->id,
                            'ratable_type' => Performer::class,
                            'ratable_id' => $performer->id,
                        ],
                        Rating::factory()->make([
                            'user_id' => $user->id,
                            'ratable_type' => Performer::class,
                            'ratable_id' => $performer->id,
                        ])->toArray()
                    );
                }
            }
        }

        $totalRatings = Rating::count();
        $this->command->info("✓ Total ratings: {$totalRatings}");
    }
}


