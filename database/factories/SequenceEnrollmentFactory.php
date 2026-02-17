<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Event;
use App\Models\SequenceEnrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SequenceEnrollment>
 */
final class SequenceEnrollmentFactory extends Factory
{
    protected $model = SequenceEnrollment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $triggerTypes = ['event_view', 'ticket_purchase', 'search', 'save', 'share'];

        return [
            'user_id' => User::factory(),
            'event_id' => Event::factory(),
            'trigger_type' => fake()->randomElement($triggerTypes),
            'current_step' => fake()->numberBetween(0, 5),
            'status' => 'active',
            'next_step_at' => fake()->dateTimeBetween('now', '+7 days'),
            'completed_at' => null,
            'step_history' => [],
        ];
    }

    /**
     * Active enrollment.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'next_step_at' => fake()->dateTimeBetween('now', '+3 days'),
            'completed_at' => null,
        ]);
    }

    /**
     * Completed enrollment.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'current_step' => 5,
            'completed_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'next_step_at' => null,
            'step_history' => array_map(fn (int $step) => [
                'step' => $step,
                'completed_at' => fake()->dateTimeBetween('-14 days', '-1 day')->format('c'),
            ], range(0, 4)),
        ]);
    }

    /**
     * Paused enrollment.
     */
    public function paused(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paused',
            'next_step_at' => null,
            'completed_at' => null,
        ]);
    }
}
