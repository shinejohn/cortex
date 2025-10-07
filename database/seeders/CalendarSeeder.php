<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CalendarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users to assign as calendar owners
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');

            return;
        }

        // Get events to add to calendars
        $events = Event::published()->get();

        $this->command->info('Creating calendars...');

        // Create 5 verified, popular, public calendars
        $popularCalendars = Calendar::factory()
            ->count(5)
            ->verified()
            ->public()
            ->create([
                'user_id' => $users->random()->id,
                'followers_count' => fake()->numberBetween(1000, 5000),
                'events_count' => fake()->numberBetween(20, 50),
            ]);

        $this->command->info('Created 5 popular verified calendars');

        // Create 10 public free calendars
        $freeCalendars = Calendar::factory()
            ->count(10)
            ->free()
            ->public()
            ->create([
                'user_id' => $users->random()->id,
                'followers_count' => fake()->numberBetween(50, 1000),
                'events_count' => fake()->numberBetween(5, 30),
            ]);

        $this->command->info('Created 10 free public calendars');

        // Create 5 paid public calendars
        $paidCalendars = Calendar::factory()
            ->count(5)
            ->paid()
            ->public()
            ->create([
                'user_id' => $users->random()->id,
                'followers_count' => fake()->numberBetween(100, 800),
                'events_count' => fake()->numberBetween(10, 40),
            ]);

        $this->command->info('Created 5 paid public calendars');

        // Create 3 private calendars
        $privateCalendars = Calendar::factory()
            ->count(3)
            ->private()
            ->create([
                'user_id' => $users->random()->id,
                'followers_count' => fake()->numberBetween(10, 100),
                'events_count' => fake()->numberBetween(5, 20),
            ]);

        $this->command->info('Created 3 private calendars');

        // Attach events to calendars
        if ($events->isNotEmpty()) {
            $this->command->info('Attaching events to calendars...');

            $allCalendars = Calendar::all();

            foreach ($allCalendars as $calendar) {
                $eventCount = min($calendar->events_count, $events->count());

                if ($eventCount > 0) {
                    $randomEvents = $events->random(min($eventCount, 15));

                    foreach ($randomEvents as $index => $event) {
                        $calendar->events()->attach($event->id, [
                            'added_by' => $calendar->user_id,
                            'position' => $index,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            $this->command->info('Events attached to calendars');
        }

        // Add followers to calendars
        $this->command->info('Adding followers to calendars...');

        foreach (Calendar::all() as $calendar) {
            $followerCount = min($calendar->followers_count, $users->count() - 1);

            if ($followerCount > 0) {
                $followers = $users->where('id', '!=', $calendar->user_id)
                    ->random(min($followerCount, 20));

                foreach ($followers as $follower) {
                    $calendar->followers()->attach($follower->id, [
                        'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        $this->command->info('Followers added to calendars');

        // Add editors to some calendars
        $this->command->info('Adding editors to calendars...');

        $calendarsWithEditors = Calendar::public()->take(5)->get();

        foreach ($calendarsWithEditors as $calendar) {
            $editorCount = fake()->numberBetween(1, 3);
            $editors = $users->where('id', '!=', $calendar->user_id)
                ->random(min($editorCount, 3));

            foreach ($editors as $editor) {
                $calendar->editors()->attach($editor->id, [
                    'role' => fake()->randomElement(['editor', 'admin']),
                    'created_at' => fake()->dateTimeBetween('-3 months', 'now'),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('Editors added to calendars');

        $this->command->info('Calendar seeding completed!');
        $this->command->info('Total calendars created: '.Calendar::count());
    }
}
