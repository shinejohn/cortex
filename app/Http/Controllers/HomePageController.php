<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;

final class HomePageController extends Controller
{
    public function index()
    {
        $featuredEvents = collect(range(1, 4))->map(function ($index) {
            $categories = ['Music', 'Technology', 'Art', 'Food'];
            $venues = [
                'Central Park Amphitheater',
                'Convention Center Downtown',
                'Gallery District',
                'Riverside Plaza',
            ];
            $images = [
                'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
            ];

            return [
                'id' => (string) $index,
                'title' => fake()->catchPhrase(),
                'date' => fake()->dateTimeBetween('now', '+3 months')->format('F j, Y'),
                'venue' => $venues[$index - 1],
                'price' => fake()->randomElement(['Free', '$' . fake()->numberBetween(10, 150)]),
                'category' => $categories[$index - 1],
                'image' => $images[$index - 1],
            ];
        })->toArray();

        $featuredVenues = collect(range(1, 4))->map(function ($index) {
            $venueTypes = ['Outdoor', 'Convention Center', 'Gallery', 'Plaza'];
            $locations = ['New York, NY', 'Chicago, IL', 'Los Angeles, CA', 'Austin, TX'];
            $names = [
                'Central Park Amphitheater',
                'Convention Center Downtown',
                'Gallery District',
                'Riverside Plaza',
            ];
            $images = [
                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
            ];

            return [
                'id' => (string) $index,
                'name' => $names[$index - 1],
                'location' => $locations[$index - 1],
                'capacity' => number_format(fake()->numberBetween(500, 15000)),
                'venueType' => $venueTypes[$index - 1],
                'rating' => fake()->randomFloat(1, 4.5, 5.0),
                'reviewCount' => (string) fake()->numberBetween(100, 800),
                'image' => $images[$index - 1],
            ];
        })->toArray();

        $featuredPerformers = collect(range(1, 4))->map(function ($index) {
            $genreGroups = [
                ['Rock', 'Alternative'],
                ['Jazz', 'Blues'],
                ['Classical', 'Symphony'],
                ['Electronic', 'House'],
            ];
            $cities = ['Nashville, TN', 'New Orleans, LA', 'Boston, MA', 'Miami, FL'];
            $venues = [
                'Madison Square Garden',
                'Blue Note',
                'Symphony Hall',
                'Club Paradise',
            ];

            return [
                'id' => (string) $index,
                'name' => fake()->name(),
                'homeCity' => $cities[$index - 1],
                'genres' => $genreGroups[$index - 1],
                'rating' => fake()->randomFloat(1, 4.5, 5.0),
                'reviewCount' => (string) fake()->numberBetween(150, 500),
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                'upcomingShow' => [
                    'date' => fake()->dateTimeBetween('now', '+3 months')->format('F j, Y'),
                    'venue' => $venues[$index - 1],
                ],
            ];
        })->toArray();

        $upcomingEvents = collect(range(1, 7))->flatMap(function ($dayIndex) {
            $categories = ['Jazz', 'Comedy', 'Community', 'Music', 'Art', 'Food & Drink', 'Literature'];
            $images = [
                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
            ];
            $fallbackImage = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop';

            $eventsPerDay = fake()->numberBetween(1, 4);

            return collect(range(1, $eventsPerDay))->map(function ($eventIndex) use ($dayIndex, $categories, $images, $fallbackImage) {
                $baseDate = now()->addDays($dayIndex - 1);
                $eventTime = $baseDate->copy()->setTime(
                    fake()->numberBetween(10, 23),
                    fake()->randomElement([0, 15, 30, 45])
                );

                return [
                    'id' => (string) (($dayIndex - 1) * 10 + $eventIndex),
                    'title' => fake()->catchPhrase(),
                    'date' => $eventTime->format('Y-m-d\TH:i:s.000\Z'),
                    'venue' => fake()->company() . ' ' . fake()->randomElement(['Club', 'Arena', 'Hall', 'Center', 'Theater']),
                    'price' => fake()->randomElement(['Free', '$' . fake()->numberBetween(10, 150)]),
                    'category' => fake()->randomElement($categories),
                    'image' => fake()->randomElement(array_merge($images, [$fallbackImage])),
                ];
            });
        })->toArray();

        return Inertia::render('welcome', [
            'featuredEvents' => $featuredEvents,
            'featuredVenues' => $featuredVenues,
            'featuredPerformers' => $featuredPerformers,
            'upcomingEvents' => $upcomingEvents,
        ]);
    }
}
