<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Region>
 */
final class RegionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->city();

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'type' => fake()->randomElement(['state', 'county', 'city', 'neighborhood']),
            'parent_id' => null,
            'description' => fake()->optional()->sentence(),
            'is_active' => fake()->boolean(90),
            'display_order' => fake()->numberBetween(0, 100),
            'metadata' => null,
        ];
    }

    public function stateRegion(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'state',
            'name' => fake()->state(),
            'slug' => Str::slug(fake()->state()),
        ]);
    }

    public function county(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'county',
            'name' => fake()->city().' County',
            'slug' => Str::slug(fake()->city().' County'),
        ]);
    }

    public function city(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'city',
            'name' => fake()->city(),
            'slug' => Str::slug(fake()->city()),
        ]);
    }

    public function neighborhood(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'neighborhood',
            'name' => fake()->randomElement(['Downtown', 'Midtown', 'Historic District', 'Arts Quarter', 'Uptown', 'Waterfront', 'Old Town', 'West End']),
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
