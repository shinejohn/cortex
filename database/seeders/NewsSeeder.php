<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\User;
use Illuminate\Database\Seeder;

final class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates admin-created articles (workspace_id = null)
     */
    public function run(): void
    {
        // Get regions for news assignment
        $chicago = Region::where('slug', 'chicago')->first();
        $naperville = Region::where('slug', 'naperville')->first();
        $aurora = Region::where('slug', 'aurora')->first();
        $cookCounty = Region::where('slug', 'cook-county')->first();
        $illinois = Region::where('slug', 'illinois')->first();

        if (! $chicago || ! $naperville || ! $aurora || ! $cookCounty || ! $illinois) {
            $this->command->warn('Regions not found. Run RegionSeeder first.');

            return;
        }

        // Create an author (optional - can be null)
        $author = User::first();

        // Chicago-specific news
        $chicagoNews = [
            [
                'title' => 'New Lakefront Development Announced for Chicago',
                'content' => $this->generateContent('Chicago\'s lakefront is set to undergo a major transformation with a new mixed-use development project announced today. The development will include residential, commercial, and public spaces designed to enhance the city\'s iconic waterfront.'),
                'excerpt' => 'Major lakefront development project aims to transform Chicago\'s waterfront experience.',
                'regions' => [$chicago->id, $cookCounty->id, $illinois->id],
            ],
            [
                'title' => 'Chicago Transit Authority Expands Service to South Side',
                'content' => $this->generateContent('The CTA announced today an expansion of bus and rail services to underserved neighborhoods on Chicago\'s South Side, with new routes beginning next month.'),
                'excerpt' => 'CTA announces new transit routes for South Side neighborhoods.',
                'regions' => [$chicago->id, $cookCounty->id],
            ],
            [
                'title' => 'Local Chicago Restaurant Wins James Beard Award',
                'content' => $this->generateContent('A beloved Chicago restaurant has been honored with the prestigious James Beard Award, recognizing its innovative approach to Midwestern cuisine.'),
                'excerpt' => 'Chicago eatery receives prestigious culinary recognition.',
                'regions' => [$chicago->id],
            ],
        ];

        // Naperville-specific news
        $napervilleNews = [
            [
                'title' => 'Naperville School District Announces New STEM Program',
                'content' => $this->generateContent('Naperville School District 203 has unveiled an ambitious new STEM curriculum that will be implemented across all middle schools starting this fall.'),
                'excerpt' => 'Enhanced STEM education coming to Naperville middle schools.',
                'regions' => [$naperville->id, $illinois->id],
            ],
            [
                'title' => 'Downtown Naperville Riverwalk Enhancement Project Begins',
                'content' => $this->generateContent('The city has broken ground on a major enhancement project for the popular Naperville Riverwalk, which will add new amenities and improve accessibility.'),
                'excerpt' => 'Riverwalk improvements aim to enhance visitor experience.',
                'regions' => [$naperville->id],
            ],
        ];

        // Aurora-specific news
        $auroraNews = [
            [
                'title' => 'Aurora Opens New Community Center on West Side',
                'content' => $this->generateContent('The city of Aurora celebrated the grand opening of its newest community center, featuring a fitness facility, meeting spaces, and programs for all ages.'),
                'excerpt' => 'New community center brings resources to Aurora\'s West Side.',
                'regions' => [$aurora->id, $illinois->id],
            ],
            [
                'title' => 'Historic Aurora Theater Completes Restoration',
                'content' => $this->generateContent('After two years of careful restoration work, Aurora\'s historic Paramount Theatre has reopened with upgraded facilities while preserving its classic architecture.'),
                'excerpt' => 'Restored historic theater returns to Aurora\'s entertainment scene.',
                'regions' => [$aurora->id],
            ],
        ];

        // Regional/statewide news
        $regionalNews = [
            [
                'title' => 'Illinois Launches New Small Business Grant Program',
                'content' => $this->generateContent('The state of Illinois has announced a new grant program designed to support small businesses across the state, with applications opening next month.'),
                'excerpt' => 'New state grant program aims to boost small business growth.',
                'regions' => [$illinois->id],
            ],
            [
                'title' => 'DuPage County Parks Add New Trail Network',
                'content' => $this->generateContent('DuPage County Forest Preserve has opened 15 miles of new hiking and biking trails, connecting several existing preserves.'),
                'excerpt' => 'New trails expand outdoor recreation opportunities in DuPage County.',
                'regions' => [$naperville->id, $aurora->id, $illinois->id],
            ],
        ];

        // Combine all news
        $allNews = array_merge($chicagoNews, $napervilleNews, $auroraNews, $regionalNews);

        // Create admin news articles (workspace_id = null indicates admin-created content)
        foreach ($allNews as $index => $newsData) {
            // Generate unique seed for consistent images
            $imageSeed = rand(1, 1000);

            $post = DayNewsPost::create([
                'workspace_id' => null, // null = admin-created content
                'author_id' => $author?->id,
                'type' => 'article',
                'category' => null,
                'title' => $newsData['title'],
                'slug' => \Illuminate\Support\Str::slug($newsData['title']),
                'content' => $newsData['content'],
                'excerpt' => $newsData['excerpt'],
                'featured_image' => "https://picsum.photos/seed/{$imageSeed}/1200/630",
                'published_at' => now()->subDays(rand(1, 30)),
                'status' => 'published',
                'view_count' => rand(50, 500),
            ]);

            // Attach regions
            $post->regions()->attach($newsData['regions']);
        }

        $this->command->info('Admin news articles seeded successfully!');
        $this->command->info('Total admin articles: '.DayNewsPost::whereNull('workspace_id')->count());
    }

    /**
     * Generate realistic article content
     */
    private function generateContent(string $opening): string
    {
        $paragraphs = [
            $opening,
            'Local officials expressed enthusiasm about the initiative, noting its potential positive impact on the community. "This represents a significant step forward," said one official.',
            'Community members have responded positively to the announcement, with many expressing hope for continued improvements. Feedback sessions and public meetings are planned to gather additional input.',
            'The project is expected to be completed over the coming months, with regular updates provided to the public. Officials encourage residents to stay informed through official channels and attend upcoming community meetings.',
        ];

        return implode("\n\n", $paragraphs);
    }
}
