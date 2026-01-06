<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UpcomingShow>
 */
final class UpcomingShowFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $venues = [
            'Capitol Theatre',
            'Jannus Live',
            'Coachman Park',
            'Blue Note Jazz Club',
            'Madison Square Garden',
            'The Apollo',
            'Red Rocks Amphitheatre',
            'House of Blues',
            'The Fillmore',
            'Whisky a Go Go',
            'First Avenue',
            'The Troubadour',
            'Mercury Lounge',
            'Exit/In',
            'The Bowery Ballroom',
        ];

        return [
            'performer_id' => \App\Models\Performer::factory(),
            'date' => fake()->dateTimeBetween('now', '+6 months'),
            'venue' => fake()->randomElement($venues),
            'tickets_available' => fake()->boolean(80),
            'ticket_url' => fake()->boolean(70) ? fake()->url() : null,
            'ticket_price' => fake()->randomFloat(2, 15.00, 150.00),
            'description' => fake()->optional(0.6)->sentence(),
        ];
    }
}
