<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
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

        // Create some featured venues
        \App\Models\Venue::factory()
            ->count(15)
            ->state([
                'verified' => true,
                'status' => 'active',
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create();

        // Create additional regular venues
        \App\Models\Venue::factory()
            ->count(35)
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create();

        // Create a specific venue matching the mock data
        \App\Models\Venue::factory()->create([
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
            'average_rating' => 4.9,
            'total_reviews' => 124,
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
    }
}
