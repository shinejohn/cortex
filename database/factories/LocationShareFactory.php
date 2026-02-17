<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\LocationShare;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LocationShare>
 */
final class LocationShareFactory extends Factory
{
    protected $model = LocationShare::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'event_id' => null,
            'group_id' => null,
            'latitude' => fake()->latitude(25.0, 45.0),
            'longitude' => fake()->longitude(-125.0, -70.0),
            'accuracy_meters' => fake()->randomFloat(2, 3, 100),
            'expires_at' => fake()->dateTimeBetween('+30 minutes', '+2 hours'),
            'stopped_at' => null,
        ];
    }

    /**
     * Expired location share.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => fake()->dateTimeBetween('-2 hours', '-10 minutes'),
        ]);
    }

    /**
     * Manually stopped location share.
     */
    public function stopped(): static
    {
        return $this->state(fn (array $attributes) => [
            'stopped_at' => fake()->dateTimeBetween('-1 hour', 'now'),
        ]);
    }
}
