<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Throwable;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DayNewsPost>
 */
final class DayNewsPostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['article', 'announcement', 'notice', 'ad', 'schedule']);
        $title = $this->faker->sentence();

        // Try to get a real image from Unsplash
        $imageUrl = $this->faker->imageUrl(800, 600, 'news');
        try {
            if (config('services.unsplash.access_key')) {
                $unsplash = app(\App\Services\UnsplashService::class);
                $photo = $unsplash->getRandomPhoto('local news, community');
                if ($photo && isset($photo['urls']['regular'])) {
                    $imageUrl = $photo['urls']['regular'];
                    // Track download as per API requirements
                    if (isset($photo['links']['download_location'])) {
                        $unsplash->trackDownload($photo['links']['download_location']);
                    }
                }
            }
        } catch (Throwable $e) {
            // Fallback to faker
        }

        return [
            'workspace_id' => \App\Models\Workspace::factory(),
            'author_id' => \App\Models\User::factory(),
            'type' => $type,
            'category' => $this->faker->optional(0.8)->randomElement([
                'local_news',
                'business',
                'sports',
                'entertainment',
                'community',
                'education',
                'health',
                'politics',
                'crime',
                'weather',
                'events',
                'obituary',
                'missing_person',
                'emergency',
                'public_notice',
                'other',
            ]),
            'title' => $title,
            'slug' => str($title)->slug()->toString(),
            'content' => $this->faker->paragraphs(5, true),
            'excerpt' => $this->faker->sentence(20),
            'featured_image' => $imageUrl,
            'metadata' => $type === 'ad' ? [
                'ad_days' => $this->faker->numberBetween(1, 30),
                'ad_placement' => $this->faker->randomElement(['sidebar', 'banner', 'inline', 'featured']),
            ] : [],
            'status' => 'draft',
            'view_count' => 0,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'view_count' => $this->faker->numberBetween(0, 1000),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'expired',
            'published_at' => $this->faker->dateTimeBetween('-60 days', '-30 days'),
            'expires_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    public function asAd(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'ad',
            'metadata' => [
                'ad_days' => $this->faker->numberBetween(7, 30),
                'ad_placement' => $this->faker->randomElement(['sidebar', 'banner', 'inline', 'featured']),
            ],
        ]);
    }

    public function freeCategory(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => $this->faker->randomElement(['obituary', 'missing_person', 'emergency', 'public_notice']),
        ]);
    }
}
