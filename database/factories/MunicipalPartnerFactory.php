<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MunicipalPartner>
 */
class MunicipalPartnerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'uuid' => \Illuminate\Support\Str::uuid(),
            'name' => $this->faker->company(),
            'type' => $this->faker->randomElement(['municipality', 'law_enforcement', 'school_district', 'utility', 'other']),
            'community_ids' => [\App\Models\Community::factory()->create()->id],
            'primary_contact_id' => $this->faker->optional()->randomElement([\App\Models\User::factory(), null]),
            'api_key_hash' => $this->faker->optional()->sha256(),
            'is_verified' => false,
            'is_active' => true,
            'allowed_categories' => $this->faker->optional()->randomElements(['weather', 'crime', 'health', 'utility', 'traffic', 'government', 'school', 'amber'], 3),
            'allowed_priorities' => $this->faker->optional()->randomElements(['critical', 'urgent', 'advisory', 'info'], 2),
            'requires_approval' => true,
        ];
    }
}
