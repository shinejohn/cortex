<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CommunityThread>
 */
final class CommunityThreadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $threadTypes = ['Discussion', 'Question', 'Announcement', 'Resource', 'Event'];
        $type = fake()->randomElement($threadTypes);

        // Different title patterns based on type
        $titles = [
            'Discussion' => [
                'What are your thoughts on {topic}?',
                'Let\'s discuss {topic}',
                'Share your experience with {topic}',
                'Community thoughts on {topic}',
                'Discussion: {topic}',
            ],
            'Question' => [
                'How do I {action}?',
                'What\'s the best way to {action}?',
                'Need help with {topic}',
                'Question about {topic}',
                'Anyone know how to {action}?',
            ],
            'Announcement' => [
                'ANNOUNCEMENT: {topic}',
                'Important update about {topic}',
                'New {topic} available',
                'Exciting news about {topic}',
                'Community update: {topic}',
            ],
            'Resource' => [
                'Useful {topic} resources',
                'Check out this {topic} guide',
                'Great {topic} collection',
                'Resource: {topic}',
                'Sharing {topic} materials',
            ],
            'Event' => [
                'Upcoming {topic} event',
                'Join us for {topic}',
                'Event: {topic} meetup',
                '{topic} workshop next week',
                'Don\'t miss this {topic} event',
            ],
        ];

        $topics = [
            'jazz improvisation',
            'seed starting',
            'container gardening',
            'music theory',
            'urban farming',
            'composting',
            'saxophone techniques',
            'herb gardens',
            'jazz history',
            'vertical gardening',
            'beginner tips',
            'advanced techniques',
            'community building',
            'best practices',
            'troubleshooting',
            'seasonal planning',
        ];

        $actions = [
            'get started',
            'improve my technique',
            'troubleshoot this issue',
            'plan my garden',
            'learn more',
            'find resources',
            'connect with others',
        ];

        $titleTemplate = fake()->randomElement($titles[$type]);
        $title = str_replace(
            ['{topic}', '{action}'],
            [fake()->randomElement($topics), fake()->randomElement($actions)],
            $titleTemplate
        );

        $content = fake()->paragraphs(fake()->numberBetween(2, 5), true);
        $preview = mb_substr(strip_tags($content), 0, 200).'...';

        $tagSets = [
            'jazz' => ['Miles Davis', 'Saxophone', 'Improvisation', 'Jazz History', 'Music Theory', 'Bebop', 'Venues', 'Albums'],
            'gardening' => ['Composting', 'Urban Farming', 'Seed Starting', 'Container Gardens', 'Herbs', 'Sustainable', 'Hydroponics'],
            'general' => ['Community', 'Tips', 'Beginner', 'Advanced', 'Help', 'Discussion', 'Resources'],
        ];

        $allTags = array_merge(...array_values($tagSets));
        $selectedTags = fake()->randomElements($allTags, fake()->numberBetween(1, 4));

        return [
            'title' => $title,
            'content' => $content,
            'preview' => $preview,
            'type' => $type,
            'tags' => $selectedTags,
            'is_pinned' => fake()->boolean(5), // 5% pinned
            'is_locked' => fake()->boolean(2), // 2% locked
            'community_id' => \App\Models\Community::factory(),
            'author_id' => \App\Models\User::factory(),
        ];
    }

    public function pinned(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_pinned' => true,
        ]);
    }

    public function locked(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_locked' => true,
        ]);
    }

    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            // 'views' will be managed by CommunityThreadViewSeeder
            // 'reply_count' will be managed by CommunityThreadReplySeeder
        ]);
    }

    public function unanswered(): static
    {
        return $this->state(fn (array $attributes) => [
            // 'reply_count' will be managed by CommunityThreadReplySeeder
        ]);
    }

    public function ofType(string $type): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => $type,
        ]);
    }
}
