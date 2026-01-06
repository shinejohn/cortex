<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmailTemplate>
 */
class EmailTemplateFactory extends Factory
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
            'name' => $this->faker->sentence(),
            'slug' => $this->faker->unique()->slug(),
            'type' => $this->faker->randomElement(['daily_digest', 'breaking_news', 'weekly_newsletter', 'smb_report', 'emergency', 'transactional']),
            'subject_template' => $this->faker->sentence(),
            'preview_text' => $this->faker->optional()->sentence(),
            'html_template' => $this->faker->paragraph(),
            'text_template' => $this->faker->optional()->paragraph(),
            'variables' => $this->faker->optional()->randomElements(['name', 'email', 'date'], 2),
            'is_active' => true,
            'version' => 1,
        ];
    }
}
