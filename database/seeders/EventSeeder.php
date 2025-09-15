<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use Exception;
use Illuminate\Database\Seeder;

final class EventSeeder extends Seeder
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

        $venues = \App\Models\Venue::limit(10)->get();
        $performers = \App\Models\Performer::limit(10)->get();

        // Create events with venues
        \App\Models\Event::factory()
            ->count(15)
            ->published()
            ->upcoming()
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($event) use ($venues) {
                $event->update(['venue_id' => $venues->random()->id]);
            });

        // Create events with performers
        \App\Models\Event::factory()
            ->count(10)
            ->published()
            ->upcoming()
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($event) use ($performers) {
                $event->update(['performer_id' => $performers->random()->id]);
            });

        // Create events with both venues and performers
        \App\Models\Event::factory()
            ->count(8)
            ->published()
            ->upcoming()
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($event) use ($venues, $performers) {
                $event->update([
                    'venue_id' => $venues->random()->id,
                    'performer_id' => $performers->random()->id,
                ]);
            });

        // Create some past events
        \App\Models\Event::factory()
            ->count(12)
            ->published()
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($event) use ($venues) {
                $event->update([
                    'event_date' => fake()->dateTimeBetween('-60 days', '-1 day'),
                    'venue_id' => $venues->random()->id,
                ]);
            });

        // Create some free events
        \App\Models\Event::factory()
            ->count(5)
            ->published()
            ->upcoming()
            ->free()
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($event) use ($venues) {
                $event->update(['venue_id' => $venues->random()->id]);
            });

        // Create some draft events
        \App\Models\Event::factory()
            ->count(6)
            ->state([
                'workspace_id' => $workspace->id,
                'created_by' => $users->random()->id,
            ])
            ->create()
            ->each(function ($event) use ($venues) {
                $event->update([
                    'status' => 'draft',
                    'venue_id' => $venues->random()->id,
                ]);
            });
    }
}
