<?php

declare(strict_types=1);

use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\NewsFactCheck;
use App\Models\Region;
use App\Services\News\ArticleGenerationService;
use App\Services\News\ImageStorageService;
use App\Services\News\PrismAiService;
use App\Services\News\UnsplashService;
use App\Services\WriterAgent\AgentAssignmentService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    // Fake storage
    Storage::fake('public');

    // Set Unsplash API key
    Config::set('news-workflow.unsplash.access_key', 'test-access-key');

    // Disable cache to avoid interference
    Config::set('cache.default', 'array');
});

it('stores Unsplash images locally during article generation', function () {
    // Enable storage and set up HTTP fakes
    Config::set('news-workflow.unsplash.storage.enabled', true);
    Config::set('news-workflow.unsplash.storage.disk', 'public');
    Config::set('news-workflow.unsplash.storage.size', 'regular');

    Http::fake([
        'https://api.unsplash.com/*' => Http::response([
            'results' => [
                [
                    'id' => 'test-unsplash-photo',
                    'urls' => [
                        'full' => 'https://images.unsplash.com/test-photo?full',
                        'regular' => 'https://images.unsplash.com/test-photo?regular',
                        'small' => 'https://images.unsplash.com/test-photo?small',
                        'thumb' => 'https://images.unsplash.com/test-photo?thumb',
                    ],
                    'user' => [
                        'name' => 'Test Photographer',
                        'username' => 'testphotographer',
                        'links' => ['html' => 'https://unsplash.com/@testphotographer'],
                    ],
                    'links' => [
                        'html' => 'https://unsplash.com/photos/test',
                        'download_location' => 'https://api.unsplash.com/photos/test/download',
                    ],
                    'alt_description' => 'Test photo alt text',
                    'description' => 'Test photo description',
                    'color' => '#123456',
                    'width' => 1920,
                    'height' => 1080,
                ],
            ],
        ]),
        'https://images.unsplash.com/*' => Http::response('fake-image-content', 200),
    ]);

    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'selected_for_generation',
        'topic_tags' => ['business', 'local'],
    ]);

    NewsFactCheck::factory()->create([
        'draft_id' => $draft->id,
        'verification_result' => 'verified',
        'confidence_score' => 90,
    ]);

    $prismAiMock = Mockery::mock(PrismAiService::class);
    $prismAiMock->shouldReceive('generateFinalArticle')
        ->once()
        ->andReturn([
            'title' => 'Test Article Title',
            'content' => '<p>Test content</p>',
            'excerpt' => 'Test excerpt',
            'seo_keywords' => ['test'],
        ]);

    $imageStorage = new ImageStorageService;
    $unsplash = new UnsplashService($imageStorage);
    $agentAssignmentMock = Mockery::mock(AgentAssignmentService::class);
    $agentAssignmentMock->shouldReceive('findBestAgent')->andReturn(null);
    $agentAssignmentMock->shouldReceive('findAnyAgent')->andReturn(null);
    $service = new ArticleGenerationService($prismAiMock, $unsplash, $agentAssignmentMock);

    $service->generateArticles($region);

    $draft->refresh();

    // Verify draft has storage path
    expect($draft->featured_image_path)->not->toBeNull();
    expect($draft->featured_image_disk)->toBe('public');
    expect($draft->featured_image_url)->not->toBeNull();

    // Verify image was actually stored
    Storage::disk('public')->assertExists($draft->featured_image_path);
});

it('falls back to Picsum and stores it locally when Unsplash fails', function () {
    Http::fake([
        'https://api.unsplash.com/*' => Http::response(['results' => []], 200), // Empty results
        'https://picsum.photos/*' => Http::response('fake-picsum-content', 200),
    ]);

    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'selected_for_generation',
    ]);

    NewsFactCheck::factory()->create([
        'draft_id' => $draft->id,
        'verification_result' => 'verified',
    ]);

    $prismAiMock = Mockery::mock(PrismAiService::class);
    $prismAiMock->shouldReceive('generateFinalArticle')
        ->once()
        ->andReturn([
            'title' => 'Test Article',
            'content' => '<p>Content</p>',
            'excerpt' => 'Excerpt',
            'seo_keywords' => [],
        ]);

    $imageStorage = new ImageStorageService;
    $unsplash = new UnsplashService($imageStorage);
    $agentAssignmentMock = Mockery::mock(AgentAssignmentService::class);
    $agentAssignmentMock->shouldReceive('findBestAgent')->andReturn(null);
    $agentAssignmentMock->shouldReceive('findAnyAgent')->andReturn(null);
    $service = new ArticleGenerationService($prismAiMock, $unsplash, $agentAssignmentMock);

    $service->generateArticles($region);

    $draft->refresh();

    // Verify Picsum fallback was stored
    expect($draft->featured_image_path)->not->toBeNull();
    expect($draft->featured_image_disk)->toBe('public');

    // Verify it was actually stored
    Storage::disk('public')->assertExists($draft->featured_image_path);

    // Verify it's a Picsum image
    expect($draft->featured_image_path)->toContain('picsum');
});

it('can disable storage via configuration', function () {
    Config::set('news-workflow.unsplash.storage.enabled', false);

    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'selected_for_generation',
    ]);

    $prismAiMock = Mockery::mock(PrismAiService::class);
    $prismAiMock->shouldReceive('generateFinalArticle')
        ->once()
        ->andReturn([
            'title' => 'Test Article',
            'content' => '<p>Content</p>',
            'excerpt' => 'Excerpt',
            'seo_keywords' => [],
        ]);

    $imageStorage = new ImageStorageService;
    $unsplash = new UnsplashService($imageStorage);
    $agentAssignmentMock = Mockery::mock(AgentAssignmentService::class);
    $agentAssignmentMock->shouldReceive('findBestAgent')->andReturn(null);
    $agentAssignmentMock->shouldReceive('findAnyAgent')->andReturn(null);
    $service = new ArticleGenerationService($prismAiMock, $unsplash, $agentAssignmentMock);

    $service->generateArticles($region);

    $draft->refresh();

    // Should have URL but no storage path (storage disabled)
    expect($draft->featured_image_url)->not->toBeNull();
    expect($draft->featured_image_path)->toBeNull();
    expect($draft->featured_image_disk)->toBeNull();
});

it('preserves attribution metadata when storing images', function () {
    Config::set('news-workflow.unsplash.storage.enabled', true);
    Config::set('news-workflow.unsplash.storage.disk', 'public');
    Config::set('news-workflow.unsplash.storage.size', 'regular');

    Http::fake([
        'https://api.unsplash.com/*' => Http::response([
            'results' => [
                [
                    'id' => 'test-unsplash-photo-2',
                    'urls' => [
                        'full' => 'https://images.unsplash.com/test-photo-2?full',
                        'regular' => 'https://images.unsplash.com/test-photo-2?regular',
                        'small' => 'https://images.unsplash.com/test-photo-2?small',
                        'thumb' => 'https://images.unsplash.com/test-photo-2?thumb',
                    ],
                    'user' => [
                        'name' => 'Test Photographer',
                        'username' => 'testphotographer',
                        'links' => ['html' => 'https://unsplash.com/@testphotographer'],
                    ],
                    'links' => [
                        'html' => 'https://unsplash.com/photos/test',
                        'download_location' => 'https://api.unsplash.com/photos/test/download',
                    ],
                    'alt_description' => 'Test photo alt text',
                    'description' => 'Test photo description',
                    'color' => '#123456',
                    'width' => 1920,
                    'height' => 1080,
                ],
            ],
        ]),
        'https://images.unsplash.com/*' => Http::response('fake-image-content', 200),
    ]);

    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'selected_for_generation',
    ]);

    $prismAiMock = Mockery::mock(PrismAiService::class);
    $prismAiMock->shouldReceive('generateFinalArticle')
        ->once()
        ->andReturn([
            'title' => 'Test Article',
            'content' => '<p>Content</p>',
            'excerpt' => 'Excerpt',
            'seo_keywords' => [],
        ]);

    $imageStorage = new ImageStorageService;
    $unsplash = new UnsplashService($imageStorage);
    $agentAssignmentMock = Mockery::mock(AgentAssignmentService::class);
    $agentAssignmentMock->shouldReceive('findBestAgent')->andReturn(null);
    $agentAssignmentMock->shouldReceive('findAnyAgent')->andReturn(null);
    $service = new ArticleGenerationService($prismAiMock, $unsplash, $agentAssignmentMock);

    $service->generateArticles($region);

    $draft->refresh();

    // Verify attribution metadata is preserved
    expect($draft->seo_metadata)->toHaveKey('image_attribution');
    expect($draft->seo_metadata)->toHaveKey('image_photographer');
    expect($draft->seo_metadata)->toHaveKey('image_alt');

    expect($draft->seo_metadata['image_attribution'])->toContain('Test Photographer');
    expect($draft->seo_metadata['image_attribution'])->toContain('Unsplash');
    expect($draft->seo_metadata['image_attribution'])->toContain('target="_blank"');
    expect($draft->seo_metadata['image_attribution'])->toContain('rel="noopener noreferrer"');
    expect($draft->seo_metadata['image_photographer'])->toBe('Test Photographer');
});
