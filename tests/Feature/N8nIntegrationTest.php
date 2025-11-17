<?php

declare(strict_types=1);

use App\Models\Business;
use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\RssFeed;
use App\Models\RssFeedItem;
use App\Models\User;
use App\Models\Workspace;

use function Pest\Laravel\getJson;
use function Pest\Laravel\patchJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
    $this->region = Region::factory()->create(['is_active' => true]);
    $this->workspace = Workspace::factory()->create();
    $this->user = User::factory()->create();
});

describe('Regions API', function () {
    it('can get all active regions', function () {
        Region::factory()->count(3)->create(['is_active' => true]);
        Region::factory()->create(['is_active' => false]);

        $response = getJson('/api/n8n/regions');

        $response->assertSuccessful();
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => ['id', 'name', 'slug', 'type'],
            ],
            'total',
        ]);
        $response->assertJsonPath('total', 4);
    });
});

describe('Business API', function () {
    it('can create a new business', function () {
        $response = postJson('/api/n8n/businesses', [
            'google_place_id' => 'ChIJtest123',
            'name' => 'Test Restaurant',
            'description' => 'A great test restaurant',
            'website' => 'https://testrestaurant.com',
            'phone' => '+1234567890',
            'email' => 'info@testrestaurant.com',
            'address' => '123 Main St',
            'city' => 'Chicago',
            'state' => 'IL',
            'postal_code' => '60601',
            'latitude' => 41.8781,
            'longitude' => -87.6298,
            'categories' => ['Restaurant', 'American'],
            'rating' => 4.5,
            'reviews_count' => 100,
            'region_ids' => [$this->region->id],
        ]);

        $response->assertSuccessful();
        $response->assertJson([
            'success' => true,
            'message' => 'Business saved successfully',
        ]);

        $this->assertDatabaseHas('businesses', [
            'google_place_id' => 'ChIJtest123',
            'name' => 'Test Restaurant',
            'slug' => 'test-restaurant',
        ]);
    });

    it('can update an existing business by google_place_id', function () {
        $business = Business::factory()->create([
            'google_place_id' => 'ChIJtest456',
            'name' => 'Old Name',
        ]);

        $response = postJson('/api/n8n/businesses', [
            'google_place_id' => 'ChIJtest456',
            'name' => 'New Name',
            'description' => 'Updated description',
        ]);

        $response->assertSuccessful();
        $business->refresh();

        expect($business->name)->toBe('New Name');
        expect($business->description)->toBe('Updated description');
    });

    it('validates required fields when creating business', function () {
        $response = postJson('/api/n8n/businesses', [
            'name' => 'Test',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['google_place_id']);
    });

    it('can attach business to multiple regions', function () {
        $region1 = Region::factory()->create();
        $region2 = Region::factory()->create();

        $response = postJson('/api/n8n/businesses', [
            'google_place_id' => 'ChIJmultiregion',
            'name' => 'Multi-Region Business',
            'region_ids' => [$region1->id, $region2->id],
        ]);

        $response->assertSuccessful();

        $business = Business::where('google_place_id', 'ChIJmultiregion')->first();
        expect($business->regions)->toHaveCount(2);
    });
});

describe('RSS Feed API', function () {
    it('can create a new RSS feed', function () {
        $business = Business::factory()->create();

        $response = postJson('/api/n8n/feeds', [
            'business_id' => $business->id,
            'url' => 'https://example.com/feed.xml',
            'feed_type' => 'news',
            'title' => 'Example News Feed',
            'description' => 'Latest news from example',
        ]);

        $response->assertSuccessful();
        $response->assertJson([
            'success' => true,
            'message' => 'Feed saved successfully',
        ]);

        $this->assertDatabaseHas('rss_feeds', [
            'business_id' => $business->id,
            'url' => 'https://example.com/feed.xml',
            'feed_type' => 'news',
        ]);
    });

    it('can update an existing RSS feed', function () {
        $business = Business::factory()->create();
        $feed = RssFeed::factory()->create([
            'business_id' => $business->id,
            'url' => 'https://example.com/feed.xml',
            'title' => 'Old Title',
        ]);

        $response = postJson('/api/n8n/feeds', [
            'business_id' => $business->id,
            'url' => 'https://example.com/feed.xml',
            'title' => 'New Title',
        ]);

        $response->assertSuccessful();
        $feed->refresh();

        expect($feed->title)->toBe('New Title');
    });

    it('validates feed type', function () {
        $business = Business::factory()->create();

        $response = postJson('/api/n8n/feeds', [
            'business_id' => $business->id,
            'url' => 'https://example.com/feed.xml',
            'feed_type' => 'invalid_type',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['feed_type']);
    });

    it('can get all feeds for a business', function () {
        $business = Business::factory()->create();
        RssFeed::factory()->count(3)->create(['business_id' => $business->id]);

        $response = getJson("/api/n8n/businesses/{$business->id}/feeds");

        $response->assertSuccessful();
        $response->assertJsonPath('total', 3);
    });

    it('can get all active feeds with filters', function () {
        RssFeed::factory()->count(2)->create(['status' => 'active', 'health_status' => 'healthy']);
        RssFeed::factory()->create(['status' => 'active', 'health_status' => 'degraded']);
        RssFeed::factory()->create(['status' => 'inactive']);

        $response = getJson('/api/n8n/feeds?health_status=healthy');

        $response->assertSuccessful();
        $response->assertJsonPath('total', 2);
    });

    it('can update feed health status', function () {
        $feed = RssFeed::factory()->create([
            'health_status' => 'healthy',
        ]);

        $response = patchJson("/api/n8n/feeds/{$feed->id}/health", [
            'health_status' => 'degraded',
            'last_error' => 'Connection timeout',
        ]);

        $response->assertSuccessful();
        $feed->refresh();

        expect($feed->health_status)->toBe('degraded');
        expect($feed->last_error)->toBe('Connection timeout');
    });

    it('marks feed as healthy and clears error', function () {
        $feed = RssFeed::factory()->create([
            'health_status' => 'unhealthy',
            'last_error' => 'Some error',
        ]);

        $response = patchJson("/api/n8n/feeds/{$feed->id}/health", [
            'health_status' => 'healthy',
        ]);

        $response->assertSuccessful();
        $feed->refresh();

        expect($feed->health_status)->toBe('healthy');
        expect($feed->last_error)->toBeNull();
        expect($feed->last_successful_fetch_at)->not->toBeNull();
    });
});

describe('Article Publishing API', function () {
    it('can publish a new article', function () {
        $feed = RssFeed::factory()->create();
        $feedItem = RssFeedItem::factory()->create([
            'rss_feed_id' => $feed->id,
            'processed' => false,
        ]);

        $response = postJson('/api/n8n/articles', [
            'workspace_id' => $this->workspace->id,
            'author_id' => $this->user->id,
            'rss_feed_id' => $feed->id,
            'rss_feed_item_id' => $feedItem->id,
            'source_type' => 'rss_feed',
            'title' => 'Breaking News Story',
            'content' => 'This is the full content of the news story.',
            'excerpt' => 'Short excerpt',
            'category' => 'local_news',
            'region_ids' => [$this->region->id],
            'status' => 'published',
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'message' => 'Article published successfully',
        ]);

        $this->assertDatabaseHas('day_news_posts', [
            'title' => 'Breaking News Story',
            'slug' => 'breaking-news-story',
            'status' => 'published',
            'rss_feed_id' => $feed->id,
            'rss_feed_item_id' => $feedItem->id,
        ]);

        $feedItem->refresh();
        expect($feedItem->processed)->toBeTrue();
    });

    it('can publish article as draft', function () {
        $response = postJson('/api/n8n/articles', [
            'workspace_id' => $this->workspace->id,
            'author_id' => $this->user->id,
            'title' => 'Draft Article',
            'content' => 'Content for draft',
            'status' => 'draft',
        ]);

        $response->assertStatus(201);

        $post = DayNewsPost::where('title', 'Draft Article')->first();
        expect($post->status)->toBe('draft');
        expect($post->published_at)->toBeNull();
    });

    it('sets published_at when status is published', function () {
        $response = postJson('/api/n8n/articles', [
            'workspace_id' => $this->workspace->id,
            'author_id' => $this->user->id,
            'title' => 'Published Article',
            'content' => 'Content',
            'status' => 'published',
        ]);

        $response->assertStatus(201);

        $post = DayNewsPost::where('title', 'Published Article')->first();
        expect($post->published_at)->not->toBeNull();
    });

    it('validates required fields for article', function () {
        $response = postJson('/api/n8n/articles', [
            'workspace_id' => $this->workspace->id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['author_id', 'title', 'content']);
    });

    it('can attach article to multiple regions', function () {
        $region1 = Region::factory()->create();
        $region2 = Region::factory()->create();

        $response = postJson('/api/n8n/articles', [
            'workspace_id' => $this->workspace->id,
            'author_id' => $this->user->id,
            'title' => 'Multi-Region Article',
            'content' => 'Content',
            'region_ids' => [$region1->id, $region2->id],
        ]);

        $response->assertStatus(201);

        $post = DayNewsPost::where('title', 'Multi-Region Article')->first();
        expect($post->regions)->toHaveCount(2);
    });

    it('can update article status from draft to published', function () {
        $post = DayNewsPost::factory()->create([
            'workspace_id' => $this->workspace->id,
            'author_id' => $this->user->id,
            'status' => 'draft',
            'published_at' => null,
        ]);

        $response = patchJson("/api/n8n/articles/{$post->id}/status", [
            'status' => 'published',
        ]);

        $response->assertSuccessful();
        $post->refresh();

        expect($post->status)->toBe('published');
        expect($post->published_at)->not->toBeNull();
    });

    it('can update article status from published to draft', function () {
        $post = DayNewsPost::factory()->create([
            'workspace_id' => $this->workspace->id,
            'author_id' => $this->user->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = patchJson("/api/n8n/articles/{$post->id}/status", [
            'status' => 'draft',
        ]);

        $response->assertSuccessful();
        $post->refresh();

        expect($post->status)->toBe('draft');
        expect($post->published_at)->toBeNull();
    });

    it('validates status when updating article', function () {
        $post = DayNewsPost::factory()->create([
            'workspace_id' => $this->workspace->id,
            'author_id' => $this->user->id,
        ]);

        $response = patchJson("/api/n8n/articles/{$post->id}/status", [
            'status' => 'invalid_status',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['status']);
    });
});

describe('API Authentication', function () {
    beforeEach(function () {
        // Reset middleware to test authentication
        $this->withMiddleware();
    });

    it('allows requests without API key when none is configured', function () {
        config(['services.n8n.api_key' => null]);

        $response = getJson('/api/n8n/regions');

        $response->assertSuccessful();
    });

    it('rejects requests without API key when key is configured', function () {
        config(['services.n8n.api_key' => 'test-secret-key']);

        $response = getJson('/api/n8n/regions');

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthorized. Invalid or missing API key.',
        ]);
    });

    it('allows requests with valid API key in X-N8N-API-Key header', function () {
        config(['services.n8n.api_key' => 'test-secret-key']);

        $response = getJson('/api/n8n/regions', [
            'X-N8N-API-Key' => 'test-secret-key',
        ]);

        $response->assertSuccessful();
    });

    it('allows requests with valid API key in Authorization Bearer header', function () {
        config(['services.n8n.api_key' => 'test-secret-key']);

        $response = getJson('/api/n8n/regions', [
            'Authorization' => 'Bearer test-secret-key',
        ]);

        $response->assertSuccessful();
    });

    it('rejects requests with invalid API key', function () {
        config(['services.n8n.api_key' => 'test-secret-key']);

        $response = getJson('/api/n8n/regions', [
            'X-N8N-API-Key' => 'wrong-key',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthorized. Invalid or missing API key.',
        ]);
    });
})->group('n8n', 'authentication');
