<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrganizationHierarchy>
 */
class OrganizationHierarchyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => \App\Models\Business::factory(),
            'parent_id' => $this->faker->optional()->randomElement([\App\Models\Business::factory(), null]),
            'level' => 0,
            'path' => $this->faker->optional()->sentence(),
        ];
    }
}
