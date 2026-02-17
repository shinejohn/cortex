<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Fan;
use App\Models\Performer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tip>
 */
final class TipFactory extends Factory
{
    public function definition(): array
    {
        $amount = fake()->randomElement([500, 1000, 2500, 5000, 10000]);

        return [
            'performer_id' => Performer::factory(),
            'fan_id' => Fan::factory(),
            'event_id' => null,
            'amount_cents' => $amount,
            'platform_fee_cents' => 0,
            'stripe_fee_cents' => (int) ($amount * 0.029 + 30),
            'net_amount_cents' => $amount - (int) ($amount * 0.029 + 30),
            'status' => 'pending',
            'stripe_payment_intent_id' => 'pi_'.fake()->unique()->regexify('[a-zA-Z0-9]{24}'),
            'stripe_charge_id' => null,
            'payment_method_type' => 'card',
            'fan_message' => fake()->optional(0.6)->sentence(),
            'is_anonymous' => fake()->boolean(20),
        ];
    }

    public function succeeded(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => 'succeeded',
            'stripe_charge_id' => 'ch_'.fake()->unique()->regexify('[a-zA-Z0-9]{24}'),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status' => 'failed',
        ]);
    }

    public function withMessage(): static
    {
        return $this->state(fn () => [
            'fan_message' => fake()->sentence(),
            'is_anonymous' => false,
        ]);
    }

    public function anonymous(): static
    {
        return $this->state(fn () => [
            'is_anonymous' => true,
        ]);
    }
}
