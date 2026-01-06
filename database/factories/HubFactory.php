<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Hub>
 */
class HubFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'workspace_id' => \App\Models\Workspace::factory(),
            'created_by' => \App\Models\User::factory(),
            'name' => $this->faker->company(),
            'slug' => $this->faker->unique()->slug(),
            'description' => $this->faker->optional()->paragraph(),
            'image' => $this->faker->optional()->imageUrl(),
            'banner_image' => $this->faker->optional()->imageUrl(),
            'about' => $this->faker->optional()->paragraph(),
            'category' => $this->faker->optional()->word(),
            'subcategory' => $this->faker->optional()->word(),
            'location' => $this->faker->optional()->address(),
            'website' => $this->faker->optional()->url(),
            'social_links' => $this->faker->optional()->randomElements(['twitter' => $this->faker->url(), 'facebook' => $this->faker->url()], 1),
            'contact_email' => $this->faker->optional()->email(),
            'contact_phone' => $this->faker->optional()->phoneNumber(),
            'is_active' => true,
            'is_featured' => false,
            'is_verified' => false,
            'design_settings' => $this->faker->optional()->randomElements(['theme' => 'light'], 1),
            'monetization_settings' => $this->faker->optional()->randomElements(['enabled' => true], 1),
            'permissions' => $this->faker->optional()->randomElements(['public' => true], 1),
            'analytics_enabled' => true,
            'articles_enabled' => true,
            'community_enabled' => true,
            'events_enabled' => true,
            'gallery_enabled' => true,
            'performers_enabled' => true,
            'venues_enabled' => true,
            'followers_count' => 0,
            'events_count' => 0,
            'articles_count' => 0,
            'members_count' => 0,
            'last_activity_at' => $this->faker->optional()->dateTime(),
            'published_at' => $this->faker->optional()->dateTime(),
        ];
    }
}
