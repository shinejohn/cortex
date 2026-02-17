<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CollectionMethod;
use App\Models\Community;
use App\Models\NewsFetchFrequency;
use App\Models\NewsSource;
use App\Models\Region;
use App\Models\RegionZipcode;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds the minimum data required for Publishing's content pipeline to operate.
 *
 * Creates: 1 Region hierarchy (Melbourne, FL), 1 Community + Workspace,
 * 1 Author User, 2 NewsSource records, 2 CollectionMethod records.
 *
 * Run: php artisan db:seed --class=PublishingPipelineSeeder
 *
 * After seeding, set these env vars on Publishing:
 * - NEWS_WORKFLOW_WORKSPACE_ID=<workspace.id>
 * - NEWS_WORKFLOW_AUTHOR_ID=<user.id>
 */
final class PublishingPipelineSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding Publishing pipeline essentials...');

        // 1. Region hierarchy: Florida > Brevard County > Melbourne
        $florida = Region::firstOrCreate(
            ['slug' => 'florida'],
            [
                'name' => 'Florida',
                'type' => 'state',
                'is_active' => true,
                'display_order' => 10,
                'latitude' => 27.6648,
                'longitude' => -81.5158,
                'metadata' => ['abbreviation' => 'FL'],
            ]
        );

        $brevard = Region::firstOrCreate(
            ['slug' => 'brevard-county'],
            [
                'name' => 'Brevard County',
                'type' => 'county',
                'parent_id' => $florida->id,
                'is_active' => true,
                'display_order' => 1,
                'latitude' => 28.2639,
                'longitude' => -80.7214,
                'metadata' => ['workflow_enabled' => true],
            ]
        );

        $melbourne = Region::firstOrCreate(
            ['slug' => 'melbourne-fl'],
            [
                'name' => 'Melbourne',
                'type' => 'city',
                'parent_id' => $brevard->id,
                'is_active' => true,
                'display_order' => 1,
                'latitude' => 28.0836,
                'longitude' => -80.6081,
                'metadata' => [
                    'timezone' => 'America/New_York',
                    'abbreviation' => 'FL',
                    'county' => 'Brevard',
                    'workflow_enabled' => true,
                ],
            ]
        );

        // Melbourne zipcodes
        $melbourneZips = ['32901', '32903', '32904', '32934', '32935', '32940'];
        foreach ($melbourneZips as $i => $zip) {
            RegionZipcode::firstOrCreate(
                ['region_id' => $melbourne->id, 'zipcode' => $zip],
                ['is_primary' => $i === 0]
            );
        }

        // News fetch frequency for Melbourne
        NewsFetchFrequency::firstOrCreate(
            ['region_id' => $melbourne->id],
            [
                'fetch_interval_minutes' => 60,
                'is_active' => true,
                'priority' => 1,
            ]
        );

        $this->command->info("  Region: {$melbourne->name} (ID: {$melbourne->id})");

        // 2. Author user (for news workflow)
        $author = User::firstOrCreate(
            ['email' => 'pipeline@publishing.local'],
            [
                'name' => 'Pipeline Author',
                'password' => Hash::make('pipeline-author-2026'),
                'email_verified_at' => now(),
            ]
        );
        $this->command->info("  Author: {$author->name} (ID: {$author->id})");

        // 3. Workspace
        $workspace = Workspace::firstOrCreate(
            ['slug' => 'publishing-pipeline'],
            [
                'name' => 'Publishing Pipeline',
                'owner_id' => $author->id,
            ]
        );
        $this->command->info("  Workspace: {$workspace->name} (ID: {$workspace->id})");

        // 4. Community linked to workspace and region
        $community = Community::firstOrCreate(
            ['slug' => 'melbourne-fl-community'],
            [
                'name' => 'Melbourne, FL',
                'workspace_id' => $workspace->id,
                'created_by' => $author->id,
                'state' => 'Florida',
                'state_code' => 'FL',
                'description' => 'Melbourne, Florida community news and events.',
                'is_active' => true,
                'is_featured' => true,
            ]
        );

        // Link region to community
        if (! $melbourne->community_id) {
            $melbourne->update(['community_id' => $community->id]);
        }

        $this->command->info("  Community: {$community->name} (ID: {$community->id})");

        // 5. NewsSource: RSS feed
        $rssSource = NewsSource::firstOrCreate(
            ['name' => 'Melbourne FL News (RSS)'],
            [
                'community_id' => $community->id,
                'region_id' => $melbourne->id,
                'source_type' => 'media',
                'is_active' => true,
                'is_verified' => true,
                'health_score' => 100,
            ]
        );

        // RSS collection method
        CollectionMethod::firstOrCreate(
            ['source_id' => $rssSource->id, 'method_type' => 'rss'],
            [
                'endpoint_url' => 'https://www.floridatoday.com/arcio/rss/',
                'poll_interval_minutes' => 60,
                'is_enabled' => true,
            ]
        );

        $this->command->info("  NewsSource (RSS): {$rssSource->name} (ID: {$rssSource->id})");

        // 6. NewsSource: SERP-based collection
        $serpSource = NewsSource::firstOrCreate(
            ['name' => 'Melbourne FL News (SERP)'],
            [
                'community_id' => $community->id,
                'region_id' => $melbourne->id,
                'source_type' => 'media',
                'subtype' => 'serp',
                'is_active' => true,
                'is_verified' => true,
                'health_score' => 100,
            ]
        );

        CollectionMethod::firstOrCreate(
            ['source_id' => $serpSource->id, 'method_type' => 'scrape'],
            [
                'endpoint_url' => 'https://serpapi.com/search',
                'poll_interval_minutes' => 360,
                'is_enabled' => true,
                'scrape_config' => [
                    'query_template' => 'Melbourne FL local news',
                    'engine' => 'google_news',
                ],
            ]
        );

        $this->command->info("  NewsSource (SERP): {$serpSource->name} (ID: {$serpSource->id})");

        // Summary
        $this->command->newLine();
        $this->command->info('Pipeline seeding complete.');
        $this->command->newLine();
        $this->command->warn('Set these env vars on Publishing:');
        $this->command->line("  NEWS_WORKFLOW_WORKSPACE_ID={$workspace->id}");
        $this->command->line("  NEWS_WORKFLOW_AUTHOR_ID={$author->id}");
        $this->command->line("  NEWS_WORKFLOW_SYSTEM_WORKSPACE_ID={$workspace->id}");
    }
}
