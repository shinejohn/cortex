<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Models\DayNewsPost;
use App\Models\Event;
use App\Models\Business;
use App\Models\Poll;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating test data for UI testing...');
        
        // Get or create a test region
        $region = Region::firstOrCreate(
            ['slug' => 'clearwater-fl'],
            [
                'id' => Str::uuid(),
                'name' => 'Clearwater',
                'state' => 'FL',
                'state_name' => 'Florida',
                'timezone' => 'America/New_York',
                'latitude' => 27.9659,
                'longitude' => -82.8001,
                'population' => 117292,
                'is_active' => true,
            ]
        );

        // Create test articles
        $categories = ['news', 'sports', 'business', 'government', 'lifestyle', 'events'];
        
        foreach ($categories as $index => $category) {
            for ($i = 1; $i <= 5; $i++) {
                DayNewsPost::firstOrCreate(
                    ['slug' => "test-{$category}-article-{$i}"],
                    [
                        'id' => Str::uuid(),
                        'region_id' => $region->id,
                        'title' => ucfirst($category) . " Test Article {$i}: Local Community Update",
                        'slug' => "test-{$category}-article-{$i}",
                        'excerpt' => "This is a test article for the {$category} category. It contains sample content for UI testing purposes.",
                        'content' => $this->generateTestContent($category, $i),
                        'category' => $category,
                        'status' => 'published',
                        'is_featured' => $i === 1,
                        'view_count' => rand(100, 5000),
                        'published_at' => now()->subHours(rand(1, 72)),
                    ]
                );
            }
        }
        
        $this->command->info('Created 30 test articles');

        // Create test events
        for ($i = 1; $i <= 10; $i++) {
            Event::firstOrCreate(
                ['slug' => "test-event-{$i}"],
                [
                    'id' => Str::uuid(),
                    'region_id' => $region->id,
                    'title' => "Test Event {$i}: Community Gathering",
                    'slug' => "test-event-{$i}",
                    'description' => "This is test event {$i} for UI testing. Join us for this community event.",
                    'venue_name' => "Test Venue {$i}",
                    'address' => "{$i}00 Main Street, Clearwater, FL 33755",
                    'start_date' => now()->addDays(rand(1, 30)),
                    'end_date' => now()->addDays(rand(31, 60)),
                    'category' => ['music', 'food', 'sports', 'community', 'arts'][rand(0, 4)],
                    'is_featured' => $i <= 3,
                    'status' => 'published',
                ]
            );
        }
        
        $this->command->info('Created 10 test events');

        // Create test businesses
        $businessTypes = ['restaurant', 'retail', 'service', 'healthcare', 'entertainment'];
        
        foreach ($businessTypes as $type) {
            for ($i = 1; $i <= 3; $i++) {
                Business::firstOrCreate(
                    ['slug' => "test-{$type}-business-{$i}"],
                    [
                        'id' => Str::uuid(),
                        'region_id' => $region->id,
                        'name' => ucfirst($type) . " Test Business {$i}",
                        'slug' => "test-{$type}-business-{$i}",
                        'description' => "This is a test {$type} business for UI testing purposes.",
                        'address' => "{$i}50 Business Blvd, Clearwater, FL 33756",
                        'phone' => "727-555-{$i}00{$i}",
                        'category' => $type,
                        'is_verified' => true,
                        'is_featured' => $i === 1,
                        'status' => 'active',
                    ]
                );
            }
        }
        
        $this->command->info('Created 15 test businesses');

        // Create test poll
        Poll::firstOrCreate(
            ['slug' => 'test-community-poll'],
            [
                'id' => Str::uuid(),
                'region_id' => $region->id,
                'title' => 'Test Community Poll: Best Local Restaurant?',
                'slug' => 'test-community-poll',
                'description' => 'Vote for your favorite local restaurant in this test poll.',
                'status' => 'active',
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addDays(7),
            ]
        );
        
        $this->command->info('Created test poll');
        $this->command->info('✅ Test data seeding complete!');
    }

    private function generateTestContent(string $category, int $index): string
    {
        return "
            <p>This is the opening paragraph of test article {$index} in the {$category} category. 
            It contains sample content designed to test the UI components of the Day.News platform.</p>
            
            <p>The second paragraph provides additional context and detail. Local community members 
            will find this information relevant to their daily lives in Clearwater, Florida.</p>
            
            <h2>Key Points</h2>
            
            <p>Here are some important details about this story that readers should know. The content
            has been structured to test various UI elements including headings, paragraphs, and formatting.</p>
            
            <p>Community engagement is at the heart of everything we do at Day.News. This platform
            serves as a hub for local news, events, and business information.</p>
            
            <blockquote>\"This is a sample quote from a community member that demonstrates the 
            pull quote styling in the article body.\" - Test Quote Attribution</blockquote>
            
            <p>The final paragraph wraps up the article with closing thoughts and potentially a 
            call to action for readers to engage with their community.</p>
        ";
    }
}
