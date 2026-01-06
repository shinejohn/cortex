<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Campaign>
 */
class CampaignFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => Str::uuid(),
            'tenant_id' => Tenant::factory(),
            'name' => $this->faker->sentence(3),
            'type' => $this->faker->randomElement(['email', 'sms', 'social', 'direct_mail', 'event']),
            'status' => $this->faker->randomElement(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled']),
            'start_date' => $this->faker->optional()->dateTimeBetween('now', '+30 days'),
            'end_date' => $this->faker->optional()->dateTimeBetween('+31 days', '+90 days'),
            'budget' => $this->faker->optional()->randomFloat(2, 100, 10000),
            'spent' => 0,
            'target_audience' => [],
            'content' => $this->faker->optional()->paragraph(),
            'metadata' => [],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the campaign is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'start_date' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    /**
     * Indicate that the campaign is scheduled.
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'scheduled',
            'start_date' => $this->faker->dateTimeBetween('now', '+30 days'),
        ]);
    }

    /**
     * Indicate that the campaign is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'start_date' => $this->faker->dateTimeBetween('-90 days', '-30 days'),
            'end_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }
}
