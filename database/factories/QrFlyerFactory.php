<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Performer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QrFlyer>
 */
final class QrFlyerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'performer_id' => Performer::factory(),
            'template' => fake()->randomElement(['default', 'modern', 'classic', 'neon']),
            'title' => fake()->sentence(3),
            'subtitle' => fake()->optional()->sentence(5),
            'qr_code_data' => 'https://goeventcity.com/p/'.fake()->slug(2),
            'qr_image_path' => null,
            'flyer_image_path' => null,
            'scan_count' => fake()->numberBetween(0, 500),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
        ]);
    }
}
