<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketOrder>
 */
final class TicketOrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 25, 500);
        $fees = $subtotal * 0.05; // 5% service fee
        $discount = $this->faker->boolean(30) ? $this->faker->randomFloat(2, 5, $subtotal * 0.2) : 0;
        $total = $subtotal + $fees - $discount;

        $statuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
        $paymentStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];

        return [
            'event_id' => Event::factory(),
            'user_id' => User::factory(),
            'status' => $this->faker->randomElement($statuses),
            'subtotal' => $subtotal,
            'fees' => $fees,
            'discount' => $discount,
            'total' => $total,
            'promo_code' => $this->faker->boolean(20) ? [
                'code' => $this->faker->bothify('SAVE##'),
                'discount_type' => $this->faker->randomElement(['percentage', 'fixed']),
                'discount_value' => $this->faker->randomFloat(2, 5, 50),
            ] : null,
            'billing_info' => [
                'name' => $this->faker->name(),
                'email' => $this->faker->email(),
                'address' => [
                    'street' => $this->faker->streetAddress(),
                    'city' => $this->faker->city(),
                    'state' => $this->faker->state(),
                    'zip' => $this->faker->postcode(),
                    'country' => $this->faker->country(),
                ],
            ],
            'payment_intent_id' => $this->faker->boolean(80) ? 'pi_'.$this->faker->regexify('[A-Za-z0-9]{24}') : null,
            'payment_status' => $this->faker->randomElement($paymentStatuses),
            'completed_at' => $this->faker->boolean(70) ? $this->faker->dateTimeThisYear() : null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_intent_id' => null,
            'completed_at' => null,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'payment_status' => 'completed',
            'payment_intent_id' => 'pi_'.$this->faker->regexify('[A-Za-z0-9]{24}'),
            'completed_at' => $this->faker->dateTimeThisYear(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'payment_status' => 'failed',
            'completed_at' => null,
        ]);
    }
}
