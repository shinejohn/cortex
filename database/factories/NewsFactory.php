<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\News>
 */
final class NewsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence();
        $content = fake()->paragraphs(5, true);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->randomNumber(5),
            'content' => $content,
            'excerpt' => fake()->optional()->paragraph(),
            'featured_image' => fake()->optional()->imageUrl(1200, 630, 'news'),
            'author_id' => null, // Will be set in tests/seeders if needed
            'published_at' => fake()->optional(0.7)->dateTimeBetween('-30 days', 'now'),
            'status' => fake()->randomElement(['draft', 'published', 'published', 'published', 'archived']),
            'view_count' => fake()->numberBetween(0, 5000),
            'metadata' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
        ]);
    }

    public function withAuthor(): static
    {
        return $this->state(fn (array $attributes) => [
            'author_id' => User::factory(),
        ]);
    }

    public function forAuthor(string $authorId): static
    {
        return $this->state(fn (array $attributes) => [
            'author_id' => $authorId,
        ]);
    }
}
