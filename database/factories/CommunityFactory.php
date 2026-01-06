<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Community>
 */
final class CommunityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $communityTypes = [
            [
                'name' => 'Jazz Lovers Collective',
                'categories' => ['music', 'arts', 'culture'],
                'image' => 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                'description' => 'A community dedicated to sharing jazz events, discussing legendary artists, and connecting musicians with venues.',
                'tags' => ['Miles Davis', 'Saxophone', 'Improvisation', 'Jazz History', 'Music Theory', 'Bebop', 'Venues', 'Albums'],
            ],
            [
                'name' => 'Urban Gardeners Network',
                'categories' => ['lifestyle', 'hobbies', 'environment'],
                'image' => 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                'description' => 'Connect with fellow urban gardeners to share tips, organize seed swaps, and collaborate on community garden projects.',
                'tags' => ['Composting', 'Urban Farming', 'Seed Starting', 'Container Gardens', 'Herbs', 'Sustainable', 'Hydroponics'],
            ],
            [
                'name' => 'Tech Entrepreneurs Hub',
                'categories' => ['technology', 'business', 'networking'],
                'image' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                'description' => 'A space for tech entrepreneurs to share insights, find co-founders, and discuss the latest trends in technology and startups.',
                'tags' => ['Startups', 'AI', 'Blockchain', 'SaaS', 'Venture Capital', 'Product Management', 'Marketing'],
            ],
            [
                'name' => 'Fitness & Wellness Community',
                'categories' => ['health', 'fitness', 'wellness'],
                'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                'description' => 'Share workout routines, healthy recipes, and motivate each other on your fitness journey.',
                'tags' => ['Workout Plans', 'Nutrition', 'Mental Health', 'Yoga', 'Running', 'Strength Training', 'Mindfulness'],
            ],
            [
                'name' => 'Book Club Society',
                'categories' => ['literature', 'education', 'culture'],
                'image' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                'description' => 'Discover new books, engage in thoughtful discussions, and connect with fellow book lovers.',
                'tags' => ['Fiction', 'Non-fiction', 'Book Reviews', 'Author Discussions', 'Reading Lists', 'Poetry', 'Biography'],
            ],
        ];

        $communityData = fake()->randomElement($communityTypes);
        $name = $communityData['name'].' '.fake()->unique()->numberBetween(1, 9999);

        return [
            'slug' => Str::slug($name),
            'name' => $name,
            'description' => $communityData['description'],
            'image' => $communityData['image'],
            'categories' => $communityData['categories'],
            'thread_types' => ['Discussion', 'Question', 'Announcement', 'Resource', 'Event'],
            'popular_tags' => $communityData['tags'],
            'is_active' => fake()->boolean(95), // 95% active
            'workspace_id' => \App\Models\Workspace::factory(),
            'created_by' => \App\Models\User::factory(),
        ];
    }

    public function jazzLovers(): static
    {
        return $this->state(fn (array $attributes) => [
            'slug' => 'jazz-lovers',
            'name' => 'Jazz Lovers Collective',
            'description' => 'A community dedicated to sharing jazz events, discussing legendary artists, and connecting musicians with venues.',
            'image' => 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'categories' => ['music', 'arts', 'culture'],
            'popular_tags' => ['Miles Davis', 'Saxophone', 'Improvisation', 'Jazz History', 'Music Theory', 'Bebop', 'Venues', 'Albums'],
        ]);
    }

    public function urbanGardeners(): static
    {
        return $this->state(fn (array $attributes) => [
            'slug' => 'urban-gardeners',
            'name' => 'Urban Gardeners Network',
            'description' => 'Connect with fellow urban gardeners to share tips, organize seed swaps, and collaborate on community garden projects.',
            'image' => 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'categories' => ['lifestyle', 'hobbies', 'environment'],
            'popular_tags' => ['Composting', 'Urban Farming', 'Seed Starting', 'Container Gardens', 'Herbs', 'Sustainable', 'Hydroponics'],
        ]);
    }

    public function techEntrepreneurs(): static
    {
        return $this->state(fn (array $attributes) => [
            'slug' => 'tech-entrepreneurs',
            'name' => 'Tech Entrepreneurs Hub',
            'description' => 'A space for tech entrepreneurs to share insights, find co-founders, and discuss the latest trends in technology and startups.',
            'image' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'categories' => ['technology', 'business', 'networking'],
            'popular_tags' => ['Startups', 'AI', 'Blockchain', 'SaaS', 'Venture Capital', 'Product Management', 'Marketing'],
        ]);
    }

    public function fitnessWellness(): static
    {
        return $this->state(fn (array $attributes) => [
            'slug' => 'fitness-wellness',
            'name' => 'Fitness & Wellness Community',
            'description' => 'Share workout routines, healthy recipes, and motivate each other on your fitness journey.',
            'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'categories' => ['health', 'fitness', 'wellness'],
            'popular_tags' => ['Workout Plans', 'Nutrition', 'Mental Health', 'Yoga', 'Running', 'Strength Training', 'Mindfulness'],
        ]);
    }

    public function bookClub(): static
    {
        return $this->state(fn (array $attributes) => [
            'slug' => 'book-club',
            'name' => 'Book Club Society',
            'description' => 'Discover new books, engage in thoughtful discussions, and connect with fellow book lovers.',
            'image' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'categories' => ['literature', 'education', 'culture'],
            'popular_tags' => ['Fiction', 'Non-fiction', 'Book Reviews', 'Author Discussions', 'Reading Lists', 'Poetry', 'Biography'],
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }
}
