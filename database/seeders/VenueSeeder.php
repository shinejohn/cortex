<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Review;
use App\Models\User;
use App\Models\Venue;
use App\Models\Workspace;
use Exception;
use Illuminate\Database\Seeder;

final class VenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the demo workspace and users
        $workspace = Workspace::where('slug', 'demo-workspace')->first();
        $users = User::where('current_workspace_id', $workspace->id)->get();

        if (! $workspace || $users->isEmpty()) {
            throw new Exception('Demo workspace and users must be created first');
        }

        // Create some featured venues with reviews
        $featuredVenues = Venue::factory()
            ->count(15)
            ->state([
                'verified' => true,
                'status' => 'active',
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create();

        // Create reviews for featured venues
        $featuredVenues->each(function ($venue) use ($users) {
            $reviewCount = fake()->numberBetween(5, 50);

            // Create reviews and calculate averages
            $reviews = collect();
            $usedUsers = collect();

            for ($i = 0; $i < $reviewCount; $i++) {
                // Find a user that hasn't reviewed this venue yet
                $availableUsers = $users->whereNotIn('id', $usedUsers);
                if ($availableUsers->isEmpty()) {
                    break; // Can't create more reviews without duplicate users
                }

                $user = $availableUsers->random();
                $usedUsers->push($user->id);

                $review = Review::factory()
                    ->state([
                        'reviewable_type' => Venue::class,
                        'reviewable_id' => $venue->id,
                        'user_id' => $user->id,
                    ])
                    ->approved()
                    ->create();

                $reviews->push($review);
            }

            // Update venue with calculated averages
            if ($reviews->isNotEmpty()) {
                $averageRating = $reviews->avg('rating');
                $venue->update([
                    'average_rating' => round($averageRating, 2),
                    'total_reviews' => $reviews->count(),
                ]);
            }
        });

        // Create additional regular venues with fewer reviews
        $regularVenues = Venue::factory()
            ->count(35)
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create();

        // Create reviews for regular venues (fewer reviews)
        $regularVenues->each(function ($venue) use ($users) {
            $reviewCount = fake()->numberBetween(0, min(15, $users->count()));

            if ($reviewCount > 0) {
                $reviews = collect();
                $usedUsers = collect();

                for ($i = 0; $i < $reviewCount; $i++) {
                    $availableUsers = $users->whereNotIn('id', $usedUsers);
                    if ($availableUsers->isEmpty()) {
                        break;
                    }

                    $user = $availableUsers->random();
                    $usedUsers->push($user->id);

                    $review = Review::factory()
                        ->state([
                            'reviewable_type' => Venue::class,
                            'reviewable_id' => $venue->id,
                            'user_id' => $user->id,
                        ])
                        ->create();

                    $reviews->push($review);
                }

                // Calculate and update averages
                $approvedReviews = $reviews->where('status', 'approved');
                if ($approvedReviews->count() > 0) {
                    $averageRating = $approvedReviews->avg('rating');
                    $venue->update([
                        'average_rating' => round($averageRating, 2),
                        'total_reviews' => $approvedReviews->count(),
                    ]);
                }
            }
        });

        // Create a specific venue matching the mock data
        $grandBallroom = Venue::factory()->create([
            'name' => 'The Grand Ballroom',
            'description' => 'An elegant ballroom with crystal chandeliers, perfect for weddings, galas, and corporate events. Features a grand staircase entrance and state-of-the-art sound system.',
            'images' => [
                'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            ],
            'verified' => true,
            'venue_type' => 'Event Spaces',
            'capacity' => 500,
            'price_per_hour' => 800,
            'price_per_event' => 5000,
            'price_per_day' => 8000,
            'workspace_id' => $workspace->id,
            'created_by' => $users->first()->id,
            'address' => '123 Main St, Clearwater, FL 33755',
            'neighborhood' => 'Downtown',
            'latitude' => 27.9659,
            'longitude' => -82.8001,
            'amenities' => ['Parking Available', 'Wheelchair Accessible', 'Kitchen/Catering', 'A/V Equipment', 'WiFi', 'Bar Service', 'Stage/Performance Area'],
            'event_types' => ['Wedding', 'Corporate', 'Gala', 'Conference'],
            'unavailable_dates' => ['2024-06-15', '2024-06-16', '2024-06-22', '2024-06-23'],
            'last_booked_days_ago' => 2,
            'response_time_hours' => 1,
            'listed_date' => '2023-01-15',
            'status' => 'active',
        ]);

        // Create high-quality reviews for The Grand Ballroom
        $grandBallroomReviews = collect();
        $usedUsers = collect();
        $targetReviewCount = min(124, $users->count());

        for ($i = 0; $i < $targetReviewCount; $i++) {
            $availableUsers = $users->whereNotIn('id', $usedUsers);
            if ($availableUsers->isEmpty()) {
                break;
            }

            $user = $availableUsers->random();
            $usedUsers->push($user->id);

            $review = Review::factory()
                ->state([
                    'reviewable_type' => Venue::class,
                    'reviewable_id' => $grandBallroom->id,
                    'user_id' => $user->id,
                    'rating' => fake()->randomElement([4, 5, 5, 5]), // Mostly 5 stars
                ])
                ->approved()
                ->create();

            $grandBallroomReviews->push($review);
        }

        // Update The Grand Ballroom with calculated averages
        if ($grandBallroomReviews->isNotEmpty()) {
            $grandBallroom->update([
                'average_rating' => round($grandBallroomReviews->avg('rating'), 2),
                'total_reviews' => $grandBallroomReviews->count(),
            ]);

            // Create some featured reviews for The Grand Ballroom (from existing reviews)
            $grandBallroomReviews->take(3)->each(function ($review) {
                $review->update([
                    'is_featured' => true,
                    'is_verified' => true,
                    'rating' => 5,
                ]);
            });
        }
    }
}
