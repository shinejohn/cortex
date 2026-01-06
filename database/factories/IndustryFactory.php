<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Industry>
 */
class IndustryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        $name = $this->faker->randomElement([
            'Restaurant', 'Retail', 'Healthcare', 'Professional Services',
            'Home Services', 'Automotive', 'Beauty & Wellness', 'Real Estate',
            'Education', 'Entertainment', 'Hospitality', 'Technology'
        ]);
        
        return [
            'id' => \Illuminate\Support\Str::uuid(),
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name) . '-' . $this->faker->unique()->randomNumber(4),
            'description' => $this->faker->optional()->paragraph(),
            'icon' => $this->faker->optional()->word(),
            'parent_id' => null,
            'default_template_id' => null,
            'available_features' => [],
            'required_fields' => [],
            'seo_title' => $this->faker->optional()->sentence(),
            'seo_description' => $this->faker->optional()->paragraph(),
            'schema_type' => $this->faker->optional()->randomElement(['LocalBusiness', 'Restaurant', 'Store', 'ProfessionalService']),
            'display_order' => $this->faker->numberBetween(0, 100),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the industry has a parent category.
     */
    public function withParent(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => \App\Models\Industry::factory(),
        ]);
    }
}
