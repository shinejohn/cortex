<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BusinessTemplate>
 */
class BusinessTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->paragraph(),
            'industry_id' => \App\Models\Industry::factory(),
            'layout_config' => ['layout' => $this->faker->word()],
            'available_tabs' => [$this->faker->word()],
            'default_tabs' => [$this->faker->word()],
            'ai_features' => ['feature' => $this->faker->word()],
            'theme_config' => ['color' => $this->faker->hexColor()],
            'component_overrides' => [],
            'seo_template' => ['title' => $this->faker->sentence()],
            'schema_template' => ['type' => 'Store'],
            'is_premium' => $this->faker->boolean(),
            'is_active' => $this->faker->boolean(),
        ];
    }
}
