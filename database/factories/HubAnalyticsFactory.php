<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HubAnalytics>
 */
class HubAnalyticsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'hub_id' => \App\Models\Hub::factory(),
            'date' => $this->faker->date(),
            'page_views' => 0,
            'unique_visitors' => 0,
            'events_created' => 0,
            'events_published' => 0,
            'articles_created' => 0,
            'articles_published' => 0,
            'members_joined' => 0,
            'followers_gained' => 0,
            'engagement_score' => 0,
            'revenue' => 0,
            'metadata' => $this->faker->optional()->randomElements(['key' => 'value'], 1),
        ];
    }
}
