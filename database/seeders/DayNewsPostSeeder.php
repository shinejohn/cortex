<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class DayNewsPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get regions for post assignment
        $chicago = Region::where('slug', 'chicago')->first();
        $naperville = Region::where('slug', 'naperville')->first();
        $aurora = Region::where('slug', 'aurora')->first();
        $cookCounty = Region::where('slug', 'cook-county')->first();
        $illinois = Region::where('slug', 'illinois')->first();

        if (! $chicago || ! $naperville || ! $aurora || ! $cookCounty || ! $illinois) {
            $this->command->warn('Regions not found. Run RegionSeeder first.');

            return;
        }

        // Get workspace and users
        $workspace = Workspace::first();
        $users = User::take(5)->get();

        if (! $workspace || $users->isEmpty()) {
            $this->command->warn('Workspace or users not found. Run DatabaseSeeder first.');

            return;
        }

        // Chicago user-submitted posts
        $chicagoPosts = [
            [
                'type' => 'article',
                'title' => 'Local Coffee Shop Opens Second Location in Logan Square',
                'content' => $this->generateContent('A popular neighborhood coffee shop is expanding with a new location in Logan Square. The family-owned business has been serving the community for over 5 years and is excited to bring their locally roasted coffee to a new neighborhood.'),
                'excerpt' => 'Neighborhood favorite expands to Logan Square with second location.',
                'regions' => [$chicago->id, $cookCounty->id],
            ],
            [
                'type' => 'announcement',
                'title' => 'Community Yard Sale This Saturday in Wicker Park',
                'content' => $this->generateContent('Join us for a community-wide yard sale this Saturday from 8am to 2pm in Wicker Park. Over 30 households participating. Find great deals on furniture, books, clothing, and more!'),
                'excerpt' => 'Multi-household yard sale happening Saturday morning.',
                'regions' => [$chicago->id],
            ],
            [
                'type' => 'notice',
                'category' => 'emergency',
                'title' => 'Water Main Break on Lincoln Avenue',
                'content' => $this->generateContent('Residents on Lincoln Avenue between Fullerton and Diversey should expect water service interruptions today due to an emergency water main repair. Service expected to be restored by 6pm.'),
                'excerpt' => 'Emergency water main repair causing service interruption.',
                'regions' => [$chicago->id],
            ],
        ];

        // Naperville user-submitted posts
        $napervillePosts = [
            [
                'type' => 'article',
                'title' => 'Youth Soccer League Registration Now Open',
                'content' => $this->generateContent('The Naperville Youth Soccer League is now accepting registrations for the fall season. Programs available for ages 4-14. Early bird discount available through the end of the month.'),
                'excerpt' => 'Fall soccer season registration open with early bird pricing.',
                'regions' => [$naperville->id],
            ],
            [
                'type' => 'announcement',
                'title' => 'Free Concert Series Returns to Central Park',
                'content' => $this->generateContent('The popular summer concert series returns to Central Park starting next Friday. Enjoy free live music every Friday evening throughout the summer. Bring your own chairs and blankets!'),
                'excerpt' => 'Free Friday night concerts starting next week at Central Park.',
                'regions' => [$naperville->id, $illinois->id],
            ],
            [
                'type' => 'ad',
                'title' => 'Professional Home Cleaning Services - 20% Off First Visit',
                'content' => $this->generateContent('Trusted home cleaning service serving Naperville for over 10 years. Licensed, bonded, and insured. Special offer: 20% off your first cleaning. Call today to schedule!'),
                'excerpt' => 'Professional cleaning with new customer discount.',
                'regions' => [$naperville->id],
            ],
        ];

        // Aurora user-submitted posts
        $auroraPosts = [
            [
                'type' => 'article',
                'title' => 'New Farmers Market Opens Downtown',
                'content' => $this->generateContent('A new farmers market is coming to downtown Aurora every Sunday starting this weekend. Local farmers and artisans will offer fresh produce, baked goods, handmade crafts, and more.'),
                'excerpt' => 'Weekly farmers market debuts Sunday in downtown Aurora.',
                'regions' => [$aurora->id, $illinois->id],
            ],
            [
                'type' => 'schedule',
                'title' => 'Public Library Summer Reading Program Schedule',
                'content' => $this->generateContent('The Aurora Public Library announces its summer reading program schedule. Story times Monday and Wednesday at 10am, teen book club Thursdays at 4pm, and family movie nights Fridays at 6pm.'),
                'excerpt' => 'Library summer programs for all ages announced.',
                'regions' => [$aurora->id],
            ],
        ];

        // Combine all posts
        $allPosts = array_merge($chicagoPosts, $napervillePosts, $auroraPosts);

        // Create posts
        foreach ($allPosts as $index => $postData) {
            // Select a random user for this post
            $user = $users->random();

            // Generate unique seed for consistent images
            $imageSeed = rand(1000, 9999);

            $post = DayNewsPost::create([
                'workspace_id' => $workspace->id,
                'author_id' => $user->id,
                'type' => $postData['type'],
                'category' => $postData['category'] ?? null,
                'title' => $postData['title'],
                'slug' => \Illuminate\Support\Str::slug($postData['title']),
                'content' => $postData['content'],
                'excerpt' => $postData['excerpt'],
                'featured_image' => "https://picsum.photos/seed/{$imageSeed}/800/600",
                'status' => 'published',
                'published_at' => now()->subDays(rand(1, 15)),
                'expires_at' => $postData['type'] === 'ad' ? now()->addDays(30) : null,
                'view_count' => rand(10, 250),
            ]);

            // Attach regions
            $post->regions()->attach($postData['regions']);
        }

        // Create a few additional random published posts
        $additionalCount = 10;
        for ($i = 0; $i < $additionalCount; $i++) {
            $user = $users->random();
            $region = collect([$chicago, $naperville, $aurora])->random();
            $type = fake()->randomElement(['article', 'announcement', 'notice', 'ad', 'schedule']);

            $imageSeed = rand(1000, 9999);
            $title = fake()->sentence(6);

            $post = DayNewsPost::create([
                'workspace_id' => $workspace->id,
                'author_id' => $user->id,
                'type' => $type,
                'category' => fake()->optional(0.2)->randomElement(['obituary', 'missing_person', 'emergency']),
                'title' => $title,
                'slug' => \Illuminate\Support\Str::slug($title),
                'content' => $this->generateContent(fake()->paragraph()),
                'excerpt' => fake()->sentence(12),
                'featured_image' => "https://picsum.photos/seed/{$imageSeed}/800/600",
                'status' => 'published',
                'published_at' => now()->subDays(rand(1, 20)),
                'expires_at' => $type === 'ad' ? now()->addDays(rand(7, 60)) : null,
                'view_count' => rand(5, 300),
            ]);

            // Attach region and parent regions
            $regionIds = [$region->id];
            if ($region->parent_id) {
                $regionIds[] = $region->parent_id;
                $parent = $region->parent;
                if ($parent && $parent->parent_id) {
                    $regionIds[] = $parent->parent_id;
                }
            }

            $post->regions()->attach($regionIds);
        }

        $this->command->info('Day News posts seeded successfully!');
        $this->command->info('Total Day News posts: '.DayNewsPost::count());
    }

    /**
     * Generate realistic post content
     */
    private function generateContent(string $opening): string
    {
        $paragraphs = [
            $opening,
            'Community members are encouraged to participate and spread the word. For more information, contact the organizers or visit the official website.',
            'This initiative reflects the vibrant community spirit and commitment to local engagement. Stay tuned for more updates and future announcements.',
        ];

        return implode("\n\n", $paragraphs);
    }
}
