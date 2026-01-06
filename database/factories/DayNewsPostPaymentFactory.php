<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DayNewsPostPayment>
 */
final class DayNewsPostPaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'post_id' => \App\Models\DayNewsPost::factory(),
            'workspace_id' => \App\Models\Workspace::factory(),
            'stripe_payment_intent_id' => $this->faker->optional()->uuid(),
            'stripe_checkout_session_id' => $this->faker->optional()->uuid(),
            'amount' => $this->faker->numberBetween(100, 10000),
            'currency' => 'usd',
            'status' => $this->faker->randomElement(['pending', 'paid', 'failed', 'refunded']),
            'payment_type' => $this->faker->randomElement(['post', 'ad']),
            'ad_days' => $this->faker->optional()->numberBetween(1, 30),
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'paid_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
        ]);
    }
}
