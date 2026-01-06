<?php

namespace Database\Factories;

use App\Models\SmbBusiness;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BusinessHours>
 */
class BusinessHoursFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dayOfWeek = $this->faker->numberBetween(0, 6); // 0 = Sunday, 6 = Saturday
        
        return [
            'id' => Str::uuid(),
            'smb_business_id' => SmbBusiness::factory(),
            'day_of_week' => $dayOfWeek,
            'open_time' => $this->faker->time('H:i'),
            'close_time' => $this->faker->time('H:i'),
            'is_closed' => false,
            'is_24_hours' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the business is closed on this day.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_closed' => true,
            'open_time' => null,
            'close_time' => null,
        ]);
    }

    /**
     * Indicate that the business is open 24 hours on this day.
     */
    public function open24Hours(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_24_hours' => true,
            'open_time' => '00:00',
            'close_time' => '23:59',
        ]);
    }
}
