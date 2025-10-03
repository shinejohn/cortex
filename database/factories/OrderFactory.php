<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
final class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 20, 500);
        $tax = $subtotal * 0.08; // 8% tax
        $shipping = fake()->randomElement([0, 5.99, 9.99, 14.99]);
        $total = $subtotal + $tax + $shipping;

        $status = fake()->randomElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
        $paymentStatus = match ($status) {
            'cancelled' => fake()->randomElement(['failed', 'refunded']),
            'delivered' => 'paid',
            'shipped', 'processing' => 'paid',
            default => fake()->randomElement(['pending', 'paid']),
        };

        return [
            'order_number' => 'ORD-'.mb_strtoupper(fake()->unique()->bothify('???###??')),
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping' => $shipping,
            'total' => $total,
            'status' => $status,
            'payment_status' => $paymentStatus,
            'shipping_address' => fake()->optional(0.9)->address(),
            'billing_address' => fake()->optional(0.8)->address(),
            'notes' => fake()->optional(0.3)->sentence(),
            'stripe_payment_intent_id' => $paymentStatus === 'paid' ? 'pi_'.fake()->bothify('??##??##??##??##') : null,
            'stripe_charge_id' => $paymentStatus === 'paid' ? 'ch_'.fake()->bothify('??##??##??##??##') : null,
            'paid_at' => $paymentStatus === 'paid' ? fake()->dateTimeBetween('-30 days', 'now') : null,
            'user_id' => null, // Will be set in seeder
            'store_id' => null, // Will be set in seeder
        ];
    }

    /**
     * Indicate that the order is pending
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);
    }

    /**
     * Indicate that the order is paid
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'paid',
            'stripe_payment_intent_id' => 'pi_'.fake()->bothify('??##??##??##??##'),
            'stripe_charge_id' => 'ch_'.fake()->bothify('??##??##??##??##'),
            'paid_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Indicate that the order is processing
     */
    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'processing',
            'payment_status' => 'paid',
            'stripe_payment_intent_id' => 'pi_'.fake()->bothify('??##??##??##??##'),
            'stripe_charge_id' => 'ch_'.fake()->bothify('??##??##??##??##'),
            'paid_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    /**
     * Indicate that the order is shipped
     */
    public function shipped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'shipped',
            'payment_status' => 'paid',
            'stripe_payment_intent_id' => 'pi_'.fake()->bothify('??##??##??##??##'),
            'stripe_charge_id' => 'ch_'.fake()->bothify('??##??##??##??##'),
            'paid_at' => fake()->dateTimeBetween('-14 days', '-3 days'),
        ]);
    }

    /**
     * Indicate that the order is delivered
     */
    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'payment_status' => 'paid',
            'stripe_payment_intent_id' => 'pi_'.fake()->bothify('??##??##??##??##'),
            'stripe_charge_id' => 'ch_'.fake()->bothify('??##??##??##??##'),
            'paid_at' => fake()->dateTimeBetween('-30 days', '-7 days'),
        ]);
    }

    /**
     * Indicate that the order is cancelled
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'payment_status' => fake()->randomElement(['failed', 'refunded']),
        ]);
    }
}
