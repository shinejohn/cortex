<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RegionZipcode>
 */
final class RegionZipcodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'region_id' => Region::factory(),
            'zipcode' => fake()->postcode(),
            'is_primary' => fake()->boolean(30),
        ];
    }

    public function primary(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_primary' => true,
        ]);
    }

    public function forRegion(string $regionId): static
    {
        return $this->state(fn (array $attributes) => [
            'region_id' => $regionId,
        ]);
    }
}
