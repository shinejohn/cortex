<?php

namespace Database\Factories;

use App\Models\Tenant;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(['pending', 'in_progress', 'completed', 'cancelled']);
        
        return [
            'id' => Str::uuid(),
            'tenant_id' => Tenant::factory(),
            'customer_id' => Customer::factory(),
            'assigned_to_id' => User::factory(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->optional()->paragraph(),
            'type' => $this->faker->randomElement(['call', 'email', 'meeting', 'follow_up', 'other']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'status' => $status,
            'due_date' => $this->faker->optional()->dateTimeBetween('now', '+30 days'),
            'completed_at' => $status === 'completed' ? $this->faker->dateTimeBetween('-7 days', 'now') : null,
            'metadata' => [],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the task is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    /**
     * Indicate that the task is high priority.
     */
    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'high',
        ]);
    }

    /**
     * Indicate that the task is urgent.
     */
    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'urgent',
            'due_date' => $this->faker->dateTimeBetween('now', '+1 day'),
        ]);
    }
}
