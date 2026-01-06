<?php

namespace Database\Factories;

use App\Models\Tenant;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Interaction>
 */
class InteractionFactory extends Factory
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
            'customer_id' => Customer::factory(),
            'type' => $this->faker->randomElement(['email', 'phone', 'meeting', 'note', 'task', 'social']),
            'subject' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'direction' => $this->faker->randomElement(['inbound', 'outbound']),
            'duration_minutes' => $this->faker->optional()->numberBetween(5, 120),
            'outcome' => $this->faker->optional()->randomElement(['positive', 'neutral', 'negative', 'no_response']),
            'next_action' => $this->faker->optional()->sentence(),
            'next_action_date' => $this->faker->optional()->dateTimeBetween('now', '+30 days'),
            'metadata' => [],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the interaction is an email.
     */
    public function email(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'email',
            'direction' => $this->faker->randomElement(['inbound', 'outbound']),
        ]);
    }

    /**
     * Indicate that the interaction is a phone call.
     */
    public function phone(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'phone',
            'duration_minutes' => $this->faker->numberBetween(5, 60),
        ]);
    }

    /**
     * Indicate that the interaction is a meeting.
     */
    public function meeting(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'meeting',
            'duration_minutes' => $this->faker->numberBetween(30, 120),
        ]);
    }
}
