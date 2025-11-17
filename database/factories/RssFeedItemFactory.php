<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\RssFeed;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RssFeedItem>
 */
final class RssFeedItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            ['Business', 'Local News'],
            ['Technology', 'Innovation'],
            ['Community', 'Events'],
            ['Food', 'Dining'],
            ['Entertainment', 'Culture'],
            ['Health', 'Wellness'],
            ['Education', 'Learning'],
            ['Sports', 'Recreation'],
        ];

        return [
            'rss_feed_id' => RssFeed::factory(),
            'guid' => Str::uuid()->toString(),
            'title' => fake()->sentence(6),
            'description' => fake()->paragraph(2),
            'content' => fake()->paragraphs(4, true),
            'url' => fake()->url(),
            'author' => fake()->name(),
            'published_at' => fake()->dateTimeBetween('-1 month', 'now'),
            'categories' => fake()->randomElement($categories),
            'metadata' => [
                'word_count' => fake()->numberBetween(100, 2000),
                'read_time' => fake()->numberBetween(1, 10),
            ],
            'processed' => fake()->boolean(30),
            'processed_at' => fake()->boolean(30) ? fake()->dateTimeBetween('-1 week', 'now') : null,
        ];
    }

    public function processed(): static
    {
        return $this->state(fn (array $attributes) => [
            'processed' => true,
            'processed_at' => now(),
        ]);
    }

    public function unprocessed(): static
    {
        return $this->state(fn (array $attributes) => [
            'processed' => false,
            'processed_at' => null,
        ]);
    }

    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'published_at' => fake()->dateTimeBetween('-3 days', 'now'),
        ]);
    }
}
