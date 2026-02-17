<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use App\Models\UserAchievementProgress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserAchievementProgress>
 */
final class UserAchievementProgressFactory extends Factory
{
    protected $model = UserAchievementProgress::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $achievements = [
            ['slug' => 'first_event', 'category' => 'explorer', 'target' => 1, 'points' => 10],
            ['slug' => 'event_explorer_5', 'category' => 'explorer', 'target' => 5, 'points' => 25],
            ['slug' => 'event_explorer_25', 'category' => 'explorer', 'target' => 25, 'points' => 100],
            ['slug' => 'social_butterfly', 'category' => 'social', 'target' => 10, 'points' => 50],
            ['slug' => 'group_creator', 'category' => 'social', 'target' => 3, 'points' => 30],
            ['slug' => 'first_ticket', 'category' => 'supporter', 'target' => 1, 'points' => 15],
            ['slug' => 'big_spender', 'category' => 'supporter', 'target' => 10, 'points' => 75],
        ];

        $achievement = fake()->randomElement($achievements);

        return [
            'user_id' => User::factory(),
            'achievement_slug' => $achievement['slug'],
            'category' => $achievement['category'],
            'current_progress' => fake()->numberBetween(0, $achievement['target'] - 1),
            'target_value' => $achievement['target'],
            'completed_at' => null,
            'points_awarded' => 0,
        ];
    }

    /**
     * Completed achievement.
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $target = $attributes['target_value'] ?? 5;
            $points = match ($attributes['achievement_slug'] ?? 'first_event') {
                'first_event' => 10,
                'event_explorer_5' => 25,
                'event_explorer_25' => 100,
                'social_butterfly' => 50,
                'group_creator' => 30,
                'first_ticket' => 15,
                'big_spender' => 75,
                default => 10,
            };

            return [
                'current_progress' => $target,
                'completed_at' => fake()->dateTimeBetween('-30 days', 'now'),
                'points_awarded' => $points,
            ];
        });
    }

    /**
     * Half-way through the achievement.
     */
    public function halfWay(): static
    {
        return $this->state(function (array $attributes) {
            $target = $attributes['target_value'] ?? 5;

            return [
                'current_progress' => (int) ceil($target / 2),
                'completed_at' => null,
                'points_awarded' => 0,
            ];
        });
    }
}
