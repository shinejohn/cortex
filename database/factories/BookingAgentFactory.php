<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookingAgent>
 */
final class BookingAgentFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company().' Booking';

        return [
            'user_id' => User::factory(),
            'agency_name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->randomNumber(4),
            'bio' => fake()->paragraph(),
            'specialties' => fake()->randomElements(['Rock', 'Jazz', 'Pop', 'Country', 'Electronic', 'Classical'], 3),
            'subscription_tier' => 'free',
            'subscription_status' => 'inactive',
            'max_clients' => 3,
            'is_marketplace_visible' => true,
            'service_areas' => [fake()->state(), fake()->state()],
            'average_rating' => fake()->randomFloat(2, 3.5, 5.0),
            'total_bookings' => fake()->numberBetween(0, 200),
        ];
    }

    public function proTier(): static
    {
        return $this->state(fn () => [
            'subscription_tier' => 'pro',
            'subscription_status' => 'active',
            'max_clients' => 15,
        ]);
    }

    public function premiumTier(): static
    {
        return $this->state(fn () => [
            'subscription_tier' => 'premium',
            'subscription_status' => 'active',
            'max_clients' => 50,
        ]);
    }

    public function marketplaceVisible(): static
    {
        return $this->state(fn () => [
            'is_marketplace_visible' => true,
        ]);
    }
}
