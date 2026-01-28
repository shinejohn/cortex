<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\CommunityHistoryEntry;
use App\Models\DayNewsPost;
use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\Region;
use App\Models\SalesOpportunity;
use App\Models\User;
use App\Services\Cies\HistoryLoggingService;
use App\Services\Cies\OpportunityAnalyzerService;
use App\Services\Cies\PollService;
use App\Services\Cies\ReaderProfileService;
use App\Services\News\TrafficControlService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Gen2TestCase;

class Gen2SystemTest extends Gen2TestCase
{
    // use RefreshDatabase; // In Gen2TestCase

    protected Region $region;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a region with a UUID
        $this->region = Region::forceCreate([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'Test Region',
            'slug' => 'test-region',
            'type' => 'city',
        ]);

        $this->user = User::forceCreate([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
    }

    public function test_it_can_publish_and_limit_traffic()
    {
        $trafficService = app(TrafficControlService::class);

        // 0. Create a source article
        $article = NewsArticle::forceCreate([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'region_id' => $this->region->id,
            'source_type' => 'category',
            'source_name' => 'Test Source',
            'title' => 'Test Article',
            'url' => 'http://example.com/test',
            'content_hash' => 'hash123',
        ]);

        // 1. Create a draft
        $draft = NewsArticleDraft::forceCreate([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'news_article_id' => $article->id,
            'region_id' => $this->region->id,
            'status' => 'ready_for_publishing',
            'generated_title' => 'Test Article',
            'generated_content' => 'Content',
            'topic_tags' => ['local'],
            'quality_score' => 90,
        ]);

        // 2. Check shouldPublish (Should be true initially)
        $this->assertTrue($trafficService->shouldPublishNow($draft));

        // 3. Simulate getting close to limit
        for ($i = 0; $i < 20; $i++) {
            $p = DayNewsPost::create([
                'title' => 'Spam ' . $i,
                'slug' => 'spam-' . $i,
                'content' => 'content',
                'excerpt' => 'excerpt',
                'published_at' => now(),
                'type' => 'article',
                'status' => 'published',
            ]);
            $p->regions()->attach($this->region->id);
        }

        // 4. Check shouldPublish (Should be false now due to target of 20)
        $this->assertFalse($trafficService->shouldPublishNow($draft), "Traffic control should halt after 20 posts");
    }

    public function test_it_detects_sales_opportunities()
    {
        // 1. Create a post with trigger keywords
        $post = DayNewsPost::create([
            'title' => 'New Italian Restaurant Grand Opening',
            'slug' => 'italian-opening',
            'content' => 'A new place is opening downtown.',
            'excerpt' => 'Grand opening event this weekend.',
            'published_at' => now(),
            'type' => 'article',
            'status' => 'published',
        ]);

        $post->regions()->attach($this->region->id);

        // 2. Run Analyzer
        // Manually trigger because observer runs on create() before regions are attached
        app(OpportunityAnalyzerService::class)->analyze($post->refresh());

        // Verify Opportunity Created
        $this->assertDatabaseHas('sales_opportunities', [
            'region_id' => $this->region->id,
            'opportunity_type' => 'new_business',
            'source_id' => $post->id,
        ]);
    }

    public function test_it_can_manage_polls()
    {
        $pollService = app(PollService::class);

        // 1. Create Poll
        $poll = $pollService->createPoll([
            'region_id' => $this->region->id,
            'title' => 'Best Burger',
            'slug' => 'best-burger',
            'voting_starts_at' => now(),
            'voting_ends_at' => now()->addDays(7),
            'poll_type' => 'weekly_smb_promotional',
            'options' => [
                ['name' => 'Burger King', 'is_sponsored' => false],
                ['name' => 'Local Joint', 'is_sponsored' => true],
            ]
        ]);

        $this->assertDatabaseCount('polls', 1);
        $this->assertCount(2, $poll->options);

        // 2. Vote
        $option = $poll->options->first();
        $poll->is_active = true;
        $poll->save();

        $result = $pollService->castVote($poll, $option, $this->user, '127.0.0.1', 'fingerprint_hash');

        $this->assertTrue($result['success']);
        $this->assertEquals(1, $poll->refresh()->total_votes);

        // 3. Double Vote Check
        $this->expectException(\Exception::class);
        $pollService->castVote($poll, $option, $this->user, '127.0.0.1', 'fingerprint_hash');
    }

    public function test_it_logs_history_and_profiles()
    {
        $historyService = app(HistoryLoggingService::class);
        $profileService = app(ReaderProfileService::class);

        // 1. Log History
        $entry = $historyService->logEvent($this->region, 'event', $this->user, [
            'event_date' => now(),
            'location_name' => 'Town Hall',
            'ai_summary' => 'Meeting happened',
        ]);

        $this->assertDatabaseHas('community_history_entries', [
            'location_name' => 'Town Hall',
            'region_id' => $this->region->id,
        ]);

        // 2. Track Reader Profile
        $profileService->trackEngagement($this->user, 'article', 'uuid-123', 'view');

        $this->assertDatabaseHas('reader_profiles', [
            'user_id' => $this->user->id,
            'total_articles_read' => 1,
        ]);
    }
}
