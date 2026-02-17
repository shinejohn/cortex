<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\UserSegment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<UserSegment>
 */
final class UserSegmentFactory extends Factory
{
    protected $model = UserSegment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'segment_type' => 'auto',
            'criteria' => [
                'min_engagement_score' => fake()->numberBetween(10, 50),
                'category' => fake()->randomElement(['music', 'food', 'sports', 'arts']),
            ],
            'member_count' => fake()->numberBetween(0, 500),
        ];
    }

    /**
     * Auto-computed segment.
     */
    public function auto(): static
    {
        return $this->state(fn (array $attributes) => [
            'segment_type' => 'auto',
        ]);
    }

    /**
     * Manually curated segment.
     */
    public function manual(): static
    {
        return $this->state(fn (array $attributes) => [
            'segment_type' => 'manual',
            'criteria' => null,
        ]);
    }
}
