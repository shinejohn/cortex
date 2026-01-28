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
        $ratableTypes = [
            \App\Models\Business::class,
            \App\Models\Event::class,
            \App\Models\Venue::class,
            \App\Models\Performer::class,
        ];
        $ratableType = $this->faker->randomElement($ratableTypes);

        return [
            'ratable_type' => $ratableType,
            'ratable_id' => $ratableType::factory(),
            'user_id' => \App\Models\User::factory(),
            'rating' => $this->faker->numberBetween(1, 5),
            'context' => $this->faker->randomElement(['overall', 'service', 'quality', 'value']),
            'notes' => $this->faker->optional()->sentence(),
            'type' => $this->faker->randomElement(['booking', 'general', 'event_attendance']),
            'booking_id' => $this->faker->boolean(30) ? \App\Models\Booking::factory() : null,
        ];
    }

    public function fromBooking(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'booking',
            'booking_id' => Booking::factory(),
        ]);
    }

    public function overall(): static
    {
        return $this->state(fn(array $attributes) => [
            'context' => 'overall',
        ]);
    }

    public function service(): static
    {
        return $this->state(fn(array $attributes) => [
            'context' => 'service',
        ]);
    }

    public function quality(): static
    {
        return $this->state(fn(array $attributes) => [
            'context' => 'quality',
        ]);
    }

    public function value(): static
    {
        return $this->state(fn(array $attributes) => [
            'context' => 'value',
        ]);
    }
}
