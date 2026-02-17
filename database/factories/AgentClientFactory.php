<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BookingAgent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AgentClient>
 */
final class AgentClientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'booking_agent_id' => BookingAgent::factory(),
            'user_id' => User::factory(),
            'client_type' => fake()->randomElement(['performer', 'venue_owner']),
            'permissions' => ['manage_bookings', 'view_calendar'],
            'status' => 'pending',
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => 'active',
            'authorized_at' => now(),
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn () => [
            'status' => 'suspended',
        ]);
    }
}
