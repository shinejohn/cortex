<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use App\Models\UserBehavioralProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserBehavioralProfile>
 */
final class UserBehavioralProfileFactory extends Factory
{
    protected $model = UserBehavioralProfile::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_affinities' => [
                'music' => fake()->randomFloat(2, 0, 1),
                'food' => fake()->randomFloat(2, 0, 1),
                'sports' => fake()->randomFloat(2, 0, 1),
                'arts' => fake()->randomFloat(2, 0, 1),
            ],
            'temporal_patterns' => [
                'preferred_day' => fake()->randomElement(['friday', 'saturday', 'sunday']),
                'preferred_time' => fake()->randomElement(['morning', 'afternoon', 'evening', 'night']),
                'most_active_hour' => fake()->numberBetween(8, 23),
            ],
            'spending_patterns' => [
                'avg_ticket_price' => fake()->randomFloat(2, 10, 200),
                'price_range' => fake()->randomElement(['budget', 'mid', 'premium']),
                'monthly_spend' => fake()->randomFloat(2, 0, 500),
            ],
            'geographic_preferences' => [
                'preferred_radius_miles' => fake()->numberBetween(5, 50),
                'center_lat' => fake()->latitude(25.0, 45.0),
                'center_lng' => fake()->longitude(-125.0, -70.0),
            ],
            'engagement_score' => fake()->numberBetween(0, 100),
            'auto_segments' => fake()->randomElements(
                ['frequent_attendee', 'music_lover', 'budget_conscious', 'early_bird', 'social_butterfly'],
                fake()->numberBetween(1, 3)
            ),
            'last_computed_at' => fake()->dateTimeBetween('-12 hours', 'now'),
        ];
    }

    /**
     * Profile that is stale and needs recomputation.
     */
    public function stale(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_computed_at' => fake()->dateTimeBetween('-7 days', '-25 hours'),
        ]);
    }
}
