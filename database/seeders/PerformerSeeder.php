<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use Exception;
use Illuminate\Database\Seeder;

final class PerformerSeeder extends Seeder
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

        // Create featured performers
        $performers = \App\Models\Performer::factory()
            ->count(10)
            ->state([
                'is_verified' => true,
                'status' => 'active',
                'available_for_booking' => true,
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create();

        // Create additional performers
        \App\Models\Performer::factory()
            ->count(25)
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create();

        // Create upcoming shows for some performers
        $performers->take(8)->each(function ($performer) {
            \App\Models\UpcomingShow::factory()
                ->count(rand(1, 4))
                ->create(['performer_id' => $performer->id]);
        });

        // Create a specific performer matching the mock data
        $sunsetVibes = \App\Models\Performer::factory()->create([
            'name' => 'The Sunset Vibes',
            'profile_image' => 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'genres' => ['Rock/Alternative', 'Indie', 'Pop/Top 40'],
            'average_rating' => 4.8,
            'total_reviews' => 42,
            'follower_count' => 12500,
            'bio' => 'The Sunset Vibes are a dynamic indie rock band known for their energetic performances and catchy melodies. With influences ranging from classic rock to modern indie pop, they create a unique sound that resonates with audiences of all ages.',
            'years_active' => 5,
            'shows_played' => 320,
            'home_city' => 'Clearwater, FL',
            'is_verified' => true,
            'is_touring_now' => true,
            'available_for_booking' => true,
            'has_merchandise' => true,
            'has_original_music' => true,
            'offers_meet_and_greet' => true,
            'takes_requests' => false,
            'available_for_private_events' => true,
            'is_family_friendly' => true,
            'has_samples' => true,
            'trending_score' => 92,
            'distance_miles' => 1.2,
            'added_date' => '2019-06-15',
            'introductory_pricing' => false,
            'base_price' => 2500,
            'status' => 'active',
            'workspace_id' => $workspace->id,
            'created_by' => $users->first()->id,
        ]);

        // Create upcoming shows for The Sunset Vibes
        \App\Models\UpcomingShow::factory()->createMany([
            [
                'performer_id' => $sunsetVibes->id,
                'date' => '2024-06-15',
                'venue' => 'Capitol Theatre',
                'tickets_available' => true,
            ],
            [
                'performer_id' => $sunsetVibes->id,
                'date' => '2024-06-22',
                'venue' => 'Jannus Live',
                'tickets_available' => true,
            ],
            [
                'performer_id' => $sunsetVibes->id,
                'date' => '2024-07-04',
                'venue' => 'Coachman Park',
                'tickets_available' => false,
            ],
        ]);
    }
}
