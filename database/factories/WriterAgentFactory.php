<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\WriterAgent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WriterAgent>
 */
final class WriterAgentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->name();
        $categories = ['local_news', 'business', 'sports', 'entertainment', 'community', 'education', 'health', 'politics', 'crime', 'weather', 'events'];

        return [
            'name' => $name,
            'bio' => fake()->paragraph(),
            'writing_style' => fake()->randomElement(WriterAgent::WRITING_STYLES),
            'persona_traits' => [
                'tone' => fake()->randomElement(['friendly', 'professional', 'authoritative', 'empathetic']),
                'voice' => fake()->randomElement(['active', 'balanced', 'measured']),
                'approach' => fake()->randomElement(['fact-focused', 'narrative', 'analytical', 'community-oriented']),
            ],
            'expertise_areas' => fake()->randomElements(
                ['local government', 'community events', 'business news', 'sports coverage', 'education', 'health', 'crime reporting'],
                fake()->numberBetween(2, 4)
            ),
            'categories' => fake()->randomElements($categories, fake()->numberBetween(2, 5)),
            'prompts' => [
                'system_prompt' => 'You are a professional local news writer.',
                'style_instructions' => 'Write in a clear, engaging style appropriate for local news readers.',
            ],
            'articles_count' => fake()->numberBetween(0, 100),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the agent is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Set a specific writing style.
     */
    public function withStyle(string $style): static
    {
        return $this->state(fn (array $attributes) => [
            'writing_style' => $style,
        ]);
    }

    /**
     * Set specific categories.
     *
     * @param  array<string>  $categories
     */
    public function withCategories(array $categories): static
    {
        return $this->state(fn (array $attributes) => [
            'categories' => $categories,
        ]);
    }
}
