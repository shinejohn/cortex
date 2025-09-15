<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
final class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $eventImages = [
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        ];

        $badges = [
            'Featured',
            'Community Pick',
            'Educational',
            'Workshop',
            'Jam Session',
            'Jazz Legend',
            'Rising Star',
            'Expert Pick',
            'Beginner Friendly',
            'Jazz History',
            'Community Event',
        ];

        $categories = ['Jazz', 'Rock', 'Pop', 'Classical', 'Electronic', 'Folk', 'R&B', 'Hip Hop'];

        $subcategories = [
            'Jazz' => ['Bebop', 'Contemporary', 'Jazz Fusion', 'Latin Jazz', 'Vocal Jazz', 'Smooth Jazz', 'Big Band'],
            'Rock' => ['Alternative', 'Indie Rock', 'Progressive', 'Classic Rock', 'Punk'],
            'Pop' => ['Top 40', 'Dance Pop', 'Electropop', 'Indie Pop'],
            'Electronic' => ['House', 'Techno', 'Ambient', 'Drum & Bass', 'Dubstep'],
        ];

        $eventTitles = [
            'Jazz Night at Blue Note',
            'Summer Jazz Festival',
            'Jazz Workshop for Beginners',
            'Late Night Jazz Session',
            'Jazz History Lecture',
            'Urban Gardening Workshop',
            'Seed Swap Meetup',
            'Vertical Gardening Demonstration',
            'Composting Basics',
            'Herb Garden Planning',
            'Live Music Showcase',
            'Acoustic Evening',
            'Electronic Music Night',
            'Classical Concert Series',
        ];

        $category = fake()->randomElement($categories);
        $isFree = fake()->boolean(40);
        $eventDate = fake()->dateTimeBetween('-10 days', '+30 days');

        return [
            'title' => fake()->randomElement($eventTitles),
            'image' => fake()->randomElement($eventImages),
            'event_date' => $eventDate,
            'time' => fake()->time('H:i A'),
            'description' => fake()->paragraph(2),
            'badges' => fake()->randomElements($badges, fake()->numberBetween(1, 3)),
            'subcategories' => fake()->randomElements($subcategories[$category] ?? ['General'], fake()->numberBetween(1, min(2, count($subcategories[$category] ?? ['General'])))),
            'category' => $category,
            'is_free' => $isFree,
            'price_min' => $isFree ? 0 : fake()->numberBetween(10, 50),
            'price_max' => $isFree ? 0 : fake()->numberBetween(60, 200),
            'community_rating' => fake()->randomFloat(1, 3.0, 5.0),
            'member_attendance' => fake()->numberBetween(5, 100),
            'member_recommendations' => fake()->numberBetween(0, 50),
            'discussion_thread_id' => 'thread-'.fake()->randomNumber(6),
            'curator_notes' => fake()->optional(0.3)->sentence(),
            'latitude' => fake()->latitude(25.0, 45.0),
            'longitude' => fake()->longitude(-125.0, -70.0),
            'status' => fake()->randomElement(['published', 'published', 'published', 'draft']), // 75% published
            'workspace_id' => null, // Will be set in seeder
            'created_by' => null, // Will be set in seeder
        ];
    }

    public function withVenue(): static
    {
        return $this->state(fn (array $attributes) => [
            'venue_id' => null, // Will be set in seeder
        ]);
    }

    public function withPerformer(): static
    {
        return $this->state(fn (array $attributes) => [
            'performer_id' => null, // Will be set in seeder
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    public function upcoming(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_date' => fake()->dateTimeBetween('now', '+30 days'),
        ]);
    }

    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_free' => true,
            'price_min' => 0,
            'price_max' => 0,
        ]);
    }
}
