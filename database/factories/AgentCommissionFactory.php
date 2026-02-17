<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\AgentClient;
use App\Models\BookingAgent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AgentCommission>
 */
final class AgentCommissionFactory extends Factory
{
    public function definition(): array
    {
        $gross = fake()->numberBetween(10000, 500000);
        $rate = fake()->randomFloat(4, 0.05, 0.15);

        return [
            'booking_agent_id' => BookingAgent::factory(),
            'agent_client_id' => AgentClient::factory(),
            'source_type' => 'booking',
            'source_id' => fake()->uuid(),
            'gross_amount_cents' => $gross,
            'commission_rate' => $rate,
            'commission_amount_cents' => (int) ($gross * $rate),
            'status' => 'pending',
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'status' => 'paid',
            'paid_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => 'approved',
        ]);
    }
}
