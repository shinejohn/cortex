<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LegalNotice>
 */
class LegalNoticeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'user_id' => $this->faker->optional()->randomElement([\App\Models\User::factory(), null]),
            'workspace_id' => $this->faker->optional()->randomElement([\App\Models\Workspace::factory(), null]),
            'type' => $this->faker->randomElement(['foreclosure', 'probate', 'name_change', 'business_formation', 'public_hearing', 'zoning', 'tax_sale', 'other']),
            'case_number' => $this->faker->optional()->bothify('CASE-####'),
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(),
            'court' => $this->faker->optional()->word(),
            'publish_date' => $this->faker->date(),
            'expiry_date' => $this->faker->optional()->date(),
            'status' => $this->faker->randomElement(['active', 'expires_soon', 'expired', 'removed']),
            'metadata' => $this->faker->optional()->randomElements(['key' => 'value'], 1),
            'views_count' => 0,
        ];
    }
}
