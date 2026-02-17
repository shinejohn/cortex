<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Performer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Fan>
 */
final class FanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'performer_id' => Performer::factory(),
            'user_id' => null,
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->optional()->phoneNumber(),
            'source' => fake()->randomElement(['landing_page', 'qr_code', 'event', 'referral']),
            'tip_count' => fake()->numberBetween(0, 20),
            'total_tips_given_cents' => fake()->numberBetween(0, 50000),
            'last_interaction_at' => fake()->optional()->dateTimeBetween('-6 months', 'now'),
            'converted_to_user_at' => null,
            'metadata' => null,
        ];
    }

    public function converted(): static
    {
        return $this->state(fn () => [
            'user_id' => User::factory(),
            'converted_to_user_at' => fake()->dateTimeBetween('-3 months', 'now'),
        ]);
    }

    public function fromQrCode(): static
    {
        return $this->state(fn () => [
            'source' => 'qr_code',
        ]);
    }
}
