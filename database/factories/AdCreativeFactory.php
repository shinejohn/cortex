<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AdCreative>
 */
class AdCreativeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'uuid' => $this->faker->uuid(),
            'campaign_id' => \App\Models\AdCampaign::factory(),
            'name' => $this->faker->sentence(2),
            'format' => $this->faker->randomElement(['leaderboard', 'medium_rectangle', 'sidebar', 'native', 'sponsored_article', 'audio', 'video']),
            'headline' => $this->faker->sentence(4),
            'body' => $this->faker->paragraph(),
            'image_url' => $this->faker->optional()->imageUrl(),
            'video_url' => $this->faker->optional()->url(),
            'audio_url' => $this->faker->optional()->url(),
            'click_url' => $this->faker->url(),
            'cta_text' => $this->faker->randomElement(['Learn More', 'Buy Now', 'Sign Up', 'Get Started']),
            'status' => $this->faker->randomElement(['draft', 'active', 'paused']),
            'width' => $this->faker->numberBetween(300, 1920),
            'height' => $this->faker->numberBetween(250, 1080),
        ];
    }
}
