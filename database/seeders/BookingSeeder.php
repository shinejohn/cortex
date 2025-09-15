<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use Exception;
use Illuminate\Database\Seeder;

final class BookingSeeder extends Seeder
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

        $events = \App\Models\Event::published()->limit(10)->get();
        $venues = \App\Models\Venue::active()->limit(15)->get();
        $performers = \App\Models\Performer::active()->limit(10)->get();

        // Create event bookings
        $events->each(function ($event) use ($workspace, $users) {
            \App\Models\Booking::factory()
                ->eventBooking()
                ->count(rand(1, 3))
                ->create([
                    'event_id' => $event->id,
                    'workspace_id' => $workspace->id,
                    'created_by' => $users->random()->id,
                ]);
        });

        // Create venue bookings
        \App\Models\Booking::factory()
            ->venueBooking()
            ->count(20)
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($booking) use ($venues) {
                $booking->update(['venue_id' => $venues->random()->id]);
            });

        // Create performer bookings
        \App\Models\Booking::factory()
            ->performerBooking()
            ->count(15)
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($booking) use ($performers) {
                $booking->update(['performer_id' => $performers->random()->id]);
            });

        // Create some confirmed and paid bookings
        \App\Models\Booking::factory()
            ->venueBooking()
            ->confirmed()
            ->paid()
            ->count(12)
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($booking) use ($venues) {
                $booking->update(['venue_id' => $venues->random()->id]);
            });

        // Create some performer bookings that are confirmed
        \App\Models\Booking::factory()
            ->performerBooking()
            ->confirmed()
            ->count(8)
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($booking) use ($performers) {
                $booking->update(['performer_id' => $performers->random()->id]);
            });

        // Create some cancelled bookings
        \App\Models\Booking::factory()
            ->count(5)
            ->state([
                'status' => 'cancelled',
                'cancelled_at' => fake()->dateTimeBetween('-30 days', 'now'),
                'cancellation_reason' => fake()->randomElement([
                    'Weather conditions',
                    'Venue unavailable',
                    'Client request',
                    'Payment issues',
                ]),
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($booking) use ($venues) {
                $booking->update(['venue_id' => $venues->random()->id]);
            });
    }
}
