<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NewsWorkflowRun>
 */
class NewsWorkflowRunFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'region_id' => $this->faker->optional()->randomElement([\App\Models\Region::factory(), null]),
            'phase' => $this->faker->randomElement(['business_discovery', 'news_collection', 'article_generation', 'fact_checking', 'publishing']),
            'status' => $this->faker->randomElement(['running', 'completed', 'failed']),
            'started_at' => now(),
            'completed_at' => $this->faker->optional()->dateTime(),
            'items_processed' => 0,
            'summary' => $this->faker->optional(0.5)->randomElement([json_encode(['processed' => 10, 'success' => 8]), null]),
            'error_message' => $this->faker->optional()->sentence(),
            'error_trace' => $this->faker->optional(0.3)->randomElement([json_encode(['file' => 'test.php', 'line' => 10]), null]),
        ];
    }
}
