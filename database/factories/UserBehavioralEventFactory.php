<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use App\Models\UserBehavioralEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserBehavioralEvent>
 */
final class UserBehavioralEventFactory extends Factory
{
    protected $model = UserBehavioralEvent::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $eventTypes = ['page_view', 'event_view', 'ticket_purchase', 'search', 'save', 'share'];
        $contentTypes = ['event', 'performer', 'venue', 'article'];
        $categories = ['music', 'food', 'sports', 'arts', 'nightlife', 'family', 'tech', 'outdoor'];
        $deviceTypes = ['mobile', 'desktop', 'tablet'];

        return [
            'user_id' => User::factory(),
            'session_id' => fake()->uuid(),
            'event_type' => fake()->randomElement($eventTypes),
            'content_type' => fake()->randomElement($contentTypes),
            'content_id' => fake()->uuid(),
            'category' => fake()->randomElement($categories),
            'context' => [
                'referrer' => fake()->optional()->url(),
                'search_query' => fake()->optional()->words(3, true),
            ],
            'device_type' => fake()->randomElement($deviceTypes),
            'latitude' => fake()->latitude(25.0, 45.0),
            'longitude' => fake()->longitude(-125.0, -70.0),
            'occurred_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
