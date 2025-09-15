<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
final class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titles = [
            'Great experience!',
            'Exceeded expectations',
            'Wonderful service',
            'Outstanding performance',
            'Highly recommend',
            'Amazing venue',
            'Professional and talented',
            'Perfect for our event',
            'Impressive quality',
            'Fantastic atmosphere',
            'Top-notch service',
            'Memorable experience',
        ];

        $positiveReviews = [
            'The venue was absolutely perfect for our event. The staff was professional and accommodating.',
            'Outstanding performance! The musician was talented and really engaged the audience.',
            'Beautiful space with excellent acoustics. Everything went smoothly.',
            'The performer was incredible and made our event truly special.',
            'Great value for money. The venue exceeded our expectations.',
            'Professional service from start to finish. Highly recommended.',
            'The atmosphere was perfect and the location was convenient for our guests.',
            'Excellent facilities and very responsive to our needs.',
        ];

        return [
            'user_id' => User::factory(),
            'title' => fake()->randomElement($titles),
            'content' => fake()->randomElement($positiveReviews),
            'rating' => fake()->numberBetween(3, 5), // Mostly positive reviews
            'is_verified' => fake()->boolean(30), // 30% verified
            'is_featured' => fake()->boolean(10), // 10% featured
            'helpful_votes' => fake()->optional(0.4)->randomElements([1, 2, 3, 4, 5], fake()->numberBetween(0, 3)),
            'helpful_count' => fn (array $attributes) => count($attributes['helpful_votes'] ?? []),
            'status' => fake()->randomElement(['approved', 'approved', 'approved', 'pending']), // 75% approved
            'approved_at' => fn (array $attributes) => $attributes['status'] === 'approved' ? fake()->dateTimeBetween('-30 days', 'now') : null,
            'approved_by' => fn (array $attributes) => $attributes['status'] === 'approved' ? User::factory() : null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'approved_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'approved_by' => User::factory(),
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'status' => 'approved',
            'approved_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'approved_by' => User::factory(),
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
        ]);
    }
}
