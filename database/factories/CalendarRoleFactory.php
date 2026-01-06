<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CalendarRole>
 */
class CalendarRoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'calendar_id' => \App\Models\Calendar::factory(),
            'user_id' => \App\Models\User::factory(),
            'role' => $this->faker->randomElement(['owner', 'editor', 'viewer']),
        ];
    }
}
