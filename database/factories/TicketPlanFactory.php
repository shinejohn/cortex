<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketPlan>
 */
final class TicketPlanFactory extends Factory
{
    public function definition(): array
    {
        $ticketTypes = [
            ['name' => 'General Admission', 'description' => 'Standard entry to the event', 'price_range' => [25, 50]],
            ['name' => 'VIP', 'description' => 'Premium access with exclusive benefits', 'price_range' => [100, 200]],
            ['name' => 'Early Bird', 'description' => 'Discounted tickets for early purchasers', 'price_range' => [15, 35]],
            ['name' => 'Student', 'description' => 'Discounted tickets for students with valid ID', 'price_range' => [10, 25]],
            ['name' => 'Group Pass', 'description' => 'Special pricing for groups of 4 or more', 'price_range' => [20, 40]],
        ];

        $ticketType = $this->faker->randomElement($ticketTypes);
        $maxQuantity = $this->faker->numberBetween(50, 500);
        $soldQuantity = $this->faker->numberBetween(0, (int) ($maxQuantity * 0.7));

        return [
            'event_id' => Event::factory(),
            'name' => $ticketType['name'],
            'description' => $ticketType['description'],
            'price' => $this->faker->randomFloat(2, $ticketType['price_range'][0], $ticketType['price_range'][1]),
            'max_quantity' => $maxQuantity,
            'available_quantity' => $maxQuantity - $soldQuantity,
            'is_active' => $this->faker->boolean(90),
            'metadata' => null,
            'sort_order' => $this->faker->numberBetween(0, 10),
        ];
    }

    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Free Community Preview',
            'description' => 'Complimentary access to community members',
            'price' => 0,
            'max_quantity' => $this->faker->numberBetween(20, 100),
        ]);
    }

    public function soldOut(): static
    {
        return $this->state(fn (array $attributes) => [
            'available_quantity' => 0,
        ]);
    }
}
