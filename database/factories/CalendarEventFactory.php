<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CalendarEvent>
 */
class CalendarEventFactory extends Factory
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
            'event_id' => \App\Models\Event::factory(),
            'added_by' => \App\Models\User::factory(),
            'position' => $this->faker->numberBetween(0, 100),
        ];
    }
}
