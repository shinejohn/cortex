<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;

final class EventsController extends Controller
{
    public function index()
    {
        $featuredEvents = collect(range(1, 6))->map(function ($index) {
            $categories = ['Music', 'Food & Drink', 'Arts', 'Family', 'Nightlife', 'Outdoor'];
            $venues = [
                'Symphony Center',
                'Rooftop Bar & Grill',
                'Modern Art Museum',
                'Community Park',
                'Downtown Club',
                'Lakeside Pavilion',
            ];
            $images = [
                'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
            ];

            return [
                'id' => (string) $index,
                'title' => fake()->catchPhrase(),
                'date' => fake()->dateTimeBetween('now', '+2 months')->format('Y-m-d\TH:i:s.000\Z'),
                'venue' => $venues[$index - 1],
                'price' => fake()->randomElement(['Free', '$' . fake()->numberBetween(15, 200)]),
                'category' => $categories[$index - 1],
                'image' => $images[$index - 1],
            ];
        })->toArray();

        $upcomingEvents = collect(range(1, 7))->flatMap(function ($dayIndex) {
            $categories = ['Music', 'Comedy', 'Community', 'Arts', 'Food & Drink', 'Literature', 'Technology'];
            $images = [
                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
            ];

            // Generate 2-5 events per day
            $eventsPerDay = fake()->numberBetween(2, 5);

            return collect(range(1, $eventsPerDay))->map(function ($eventIndex) use ($dayIndex, $categories, $images) {
                $baseDate = now()->addDays($dayIndex - 1);
                $eventTime = $baseDate->copy()->setTime(
                    fake()->numberBetween(9, 23),
                    fake()->randomElement([0, 15, 30, 45])
                );

                $venueTypes = ['Theater', 'Club', 'Hall', 'Center', 'Gallery', 'Cafe', 'Park', 'Studio'];
                $venueNames = [
                    'The Grand',
                    'City',
                    'Central',
                    'Riverside',
                    'Downtown',
                    'Heritage',
                    'Modern',
                    'Classic',
                ];

                return [
                    'id' => (string) (($dayIndex - 1) * 10 + $eventIndex),
                    'title' => fake()->catchPhrase(),
                    'date' => $eventTime->format('Y-m-d\TH:i:s.000\Z'),
                    'venue' => fake()->randomElement($venueNames) . ' ' . fake()->randomElement($venueTypes),
                    'price' => fake()->randomElement(['Free', '$' . fake()->numberBetween(5, 120)]),
                    'category' => fake()->randomElement($categories),
                    'image' => fake()->randomElement($images),
                ];
            });
        })->toArray();

        return Inertia::render('events', [
            'featuredEvents' => $featuredEvents,
            'upcomingEvents' => $upcomingEvents,
        ]);
    }
}
