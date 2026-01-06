<?php

namespace Database\Factories;

use App\Models\Tenant;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Deal>
 */
class DealFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 100, 50000);
        
        return [
            'id' => Str::uuid(),
            'tenant_id' => Tenant::factory(),
            'customer_id' => Customer::factory(),
            'name' => $this->faker->sentence(3),
            'amount' => $amount,
            'currency' => 'USD',
            'stage' => $this->faker->randomElement(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
            'probability' => $this->faker->numberBetween(0, 100),
            'expected_close_date' => $this->faker->dateTimeBetween('now', '+90 days'),
            'actual_close_date' => null,
            'description' => $this->faker->optional()->paragraph(),
            'tags' => [],
            'custom_fields' => [],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the deal is won.
     */
    public function won(): static
    {
        return $this->state(fn (array $attributes) => [
            'stage' => 'closed_won',
            'probability' => 100,
            'actual_close_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Indicate that the deal is lost.
     */
    public function lost(): static
    {
        return $this->state(fn (array $attributes) => [
            'stage' => 'closed_lost',
            'probability' => 0,
            'actual_close_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Indicate that the deal is in negotiation.
     */
    public function negotiating(): static
    {
        return $this->state(fn (array $attributes) => [
            'stage' => 'negotiation',
            'probability' => $this->faker->numberBetween(60, 90),
        ]);
    }
}
