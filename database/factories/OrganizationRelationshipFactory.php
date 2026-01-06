<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrganizationRelationship>
 */
class OrganizationRelationshipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $relatableTypes = [
            \App\Models\DayNewsPost::class,
            \App\Models\Event::class,
            \App\Models\Business::class,
        ];
        $relatableType = $this->faker->randomElement($relatableTypes);
        
        return [
            'organization_id' => \App\Models\Business::factory(),
            'relatable_type' => $relatableType,
            'relatable_id' => $relatableType::factory(),
            'relationship_type' => $this->faker->randomElement(['related', 'sponsored', 'featured', 'partner', 'host', 'organizer', 'venue', 'sponsor', 'author', 'source', 'subject']),
            'is_primary' => false,
            'metadata' => $this->faker->optional()->randomElements(['key' => 'value'], 1),
        ];
    }
}
