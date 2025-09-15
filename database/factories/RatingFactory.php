<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rating>
 */
final class RatingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $contexts = ['overall', 'service', 'quality', 'value', 'performance', 'professionalism'];
        $types = ['general', 'booking', 'event_attendance'];

        $type = fake()->randomElement($types);

        return [
            'user_id' => User::factory(),
            'rating' => fake()->numberBetween(3, 5), // Mostly positive ratings
            'context' => fake()->randomElement($contexts),
            'notes' => fake()->optional(0.3)->sentence(),
            'type' => $type,
            'booking_id' => $type === 'booking' ? Booking::factory() : null,
        ];
    }

    public function fromBooking(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'booking',
            'booking_id' => Booking::factory(),
        ]);
    }

    public function overall(): static
    {
        return $this->state(fn (array $attributes) => [
            'context' => 'overall',
        ]);
    }

    public function service(): static
    {
        return $this->state(fn (array $attributes) => [
            'context' => 'service',
        ]);
    }

    public function quality(): static
    {
        return $this->state(fn (array $attributes) => [
            'context' => 'quality',
        ]);
    }

    public function value(): static
    {
        return $this->state(fn (array $attributes) => [
            'context' => 'value',
        ]);
    }
}
