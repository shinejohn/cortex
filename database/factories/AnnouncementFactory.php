<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Announcement>
 */
class AnnouncementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'workspace_id' => \App\Models\Workspace::factory(),
            'type' => $this->faker->randomElement([
                'wedding',
                'engagement',
                'birth',
                'graduation',
                'anniversary',
                'celebration',
                'general',
                'community_event',
                'public_notice',
                'emergency_alert',
                'meeting',
                'volunteer_opportunity',
                'road_closure',
                'school_announcement',
            ]),
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(),
            'image' => $this->faker->optional()->url(),
            'location' => $this->faker->optional()->city(),
            'event_date' => $this->faker->optional()->date(),
            'status' => $this->faker->randomElement(['draft', 'pending', 'published', 'expired', 'removed']),
            'published_at' => $this->faker->dateTime(),
            'expires_at' => $this->faker->dateTime(),
            'views_count' => $this->faker->numberBetween(0, 100),
            'reactions_count' => $this->faker->numberBetween(0, 100),
            'comments_count' => $this->faker->numberBetween(0, 100),
        ];
    }
}
