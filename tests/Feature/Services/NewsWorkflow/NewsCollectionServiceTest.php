<?php

declare(strict_types=1);

use App\Jobs\News\ProcessBusinessNewsCollectionJob;
use App\Models\Business;
use App\Models\NewsArticle;
use App\Models\Region;
use App\Services\News\NewsCollectionService;
use App\Services\News\SerpApiService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->serpApiMock = \Mockery::mock(SerpApiService::class);
    $this->service = new NewsCollectionService($this->serpApiMock);
});

it('collects news for a region by dispatching jobs', function () {
    Queue::fake();

    $region = Region::factory()->create([
        'name' => 'Test City',
    ]);

    $business = Business::factory()->create();
    $region->businesses()->attach($business);

    $mockCategoryNews = [
        [
            'title' => 'Category News Article',
            'url' => 'https://example.com/article2',
            'content_snippet' => 'Category content',
            'source_publisher' => 'Test Publisher',
            'published_at' => now(),
            'business_id' => null,
            'source_type' => 'category',
            'source_name' => '',
            'metadata' => [],
        ],
    ];

    $this->serpApiMock
        ->shouldReceive('fetchCategoryNews')
        ->atLeast()
        ->once()
        ->andReturn($mockCategoryNews);

    $count = $this->service->collectForRegion($region);

    // Should dispatch one job per business
    Queue::assertPushed(ProcessBusinessNewsCollectionJob::class, 1);

    // Count should be jobs dispatched + category articles
    expect($count)->toBeGreaterThanOrEqual(1);
});

it('returns zero when news collection is disabled', function () {
    Config::set('news-workflow.news_collection.enabled', false);

    $region = Region::factory()->create();

    $this->serpApiMock->shouldNotReceive('fetchNewsForBusiness');
    $this->serpApiMock->shouldNotReceive('fetchCategoryNews');

    $count = $this->service->collectForRegion($region);

    expect($count)->toBe(0);
});

it('stores news article with deduplication', function () {
    $region = Region::factory()->create();

    $articleData = [
        'title' => 'Test Article',
        'url' => 'https://example.com/test',
        'content_snippet' => 'Test content',
        'source_publisher' => 'Test Publisher',
        'published_at' => now(),
        'business_id' => null,
        'source_type' => 'category',
        'source_name' => '',
        'metadata' => [],
    ];

    // Store first time
    $article1 = $this->service->storeNewsArticle($articleData, $region);

    expect($article1)->toBeInstanceOf(NewsArticle::class);
    expect($article1->title)->toBe('Test Article');
    expect(NewsArticle::count())->toBe(1);

    // Try to store duplicate
    $article2 = $this->service->storeNewsArticle($articleData, $region);

    expect($article2)->toBeNull(); // Duplicate returns null
    expect(NewsArticle::count())->toBe(1); // Still only one article
});

it('generates unique content hash for articles', function () {
    $region = Region::factory()->create();

    $articleData1 = [
        'title' => 'Article 1',
        'url' => 'https://example.com/1',
        'content_snippet' => 'Content 1',
        'source_publisher' => 'Publisher 1',
        'published_at' => now(),
        'metadata' => [],
    ];

    $articleData2 = [
        'title' => 'Article 2',
        'url' => 'https://example.com/2',
        'content_snippet' => 'Content 2',
        'source_publisher' => 'Publisher 2',
        'published_at' => now(),
        'metadata' => [],
    ];

    $article1 = $this->service->storeNewsArticle($articleData1, $region);
    $article2 = $this->service->storeNewsArticle($articleData2, $region);

    expect($article1->content_hash)->not->toBe($article2->content_hash);
    expect(NewsArticle::count())->toBe(2);
});

it('fetches news for a single business correctly', function () {
    $region = Region::factory()->create();
    $business = Business::factory()->create(['name' => 'Test Business']);

    $mockNewsData = [
        [
            'title' => 'Business Article',
            'url' => 'https://example.com/biz',
            'content_snippet' => 'Business news',
            'source_publisher' => 'Publisher',
            'published_at' => now(),
            'business_id' => $business->id,
            'source_type' => 'business',
            'source_name' => $business->name,
            'metadata' => [],
        ],
    ];

    $this->serpApiMock
        ->shouldReceive('fetchNewsForBusiness')
        ->once()
        ->with($business)
        ->andReturn($mockNewsData);

    $articles = $this->service->fetchNewsForBusiness($business, $region);

    expect($articles)->toHaveCount(1);
    expect($articles[0])->toBeInstanceOf(NewsArticle::class);
    expect($articles[0]->source_type)->toBe('business');
});

it('fetches category news correctly', function () {
    $region = Region::factory()->create();

    $mockNewsData = [
        [
            'title' => 'Category Article',
            'url' => 'https://example.com/cat',
            'content_snippet' => 'Category news',
            'source_publisher' => 'Publisher',
            'published_at' => now(),
            'business_id' => null,
            'source_type' => 'category',
            'source_name' => '',
            'metadata' => [],
        ],
    ];

    $this->serpApiMock
        ->shouldReceive('fetchCategoryNews')
        ->atLeast()
        ->once()
        ->andReturn($mockNewsData);

    $articles = $this->service->fetchCategoryNews($region);

    expect($articles)->toHaveCount(1);
    expect($articles[0])->toBeInstanceOf(NewsArticle::class);
    expect($articles[0]->source_type)->toBe('category');
});

it('limits articles per business', function () {
    Config::set('news-workflow.news_collection.max_articles_per_business', 2);

    $region = Region::factory()->create();
    $business = Business::factory()->create();

    // Mock returns 5 articles, but service should only store 2
    $mockNewsData = collect(range(1, 5))->map(fn ($i) => [
        'title' => "Article {$i}",
        'url' => "https://example.com/{$i}",
        'content_snippet' => "Content {$i}",
        'source_publisher' => 'Publisher',
        'published_at' => now(),
        'business_id' => $business->id,
        'source_type' => 'business',
        'source_name' => $business->name,
        'metadata' => [],
    ])->toArray();

    $this->serpApiMock
        ->shouldReceive('fetchNewsForBusiness')
        ->once()
        ->with($business)
        ->andReturn($mockNewsData);

    $articles = $this->service->fetchNewsForBusiness($business, $region);

    expect($articles)->toHaveCount(2);
});

it('limits total category articles', function () {
    Config::set('news-workflow.news_collection.max_category_articles', 3);

    $region = Region::factory()->create();

    // Each category returns 5 articles
    $mockNewsData = collect(range(1, 5))->map(fn ($i) => [
        'title' => "Article {$i}",
        'url' => "https://example.com/{$i}",
        'content_snippet' => "Content {$i}",
        'source_publisher' => 'Publisher',
        'published_at' => now(),
        'metadata' => [],
    ])->toArray();

    $this->serpApiMock
        ->shouldReceive('fetchCategoryNews')
        ->andReturn($mockNewsData);

    $articles = $this->service->fetchCategoryNews($region);

    // Should stop at max_category_articles (3)
    expect($articles)->toHaveCount(3);
});

it('marks stored articles as unprocessed', function () {
    $region = Region::factory()->create();

    $articleData = [
        'title' => 'Test Article',
        'url' => 'https://example.com/test',
        'content_snippet' => 'Content',
        'source_publisher' => 'Publisher',
        'published_at' => now(),
        'metadata' => [],
    ];

    $article = $this->service->storeNewsArticle($articleData, $region);

    expect($article->processed)->toBeFalse();
});

it('handles errors gracefully when storing articles', function () {
    $region = Region::factory()->create();
    $business = Business::factory()->create();

    $mockNewsData = [
        [
            'title' => 'Valid Article',
            'url' => 'https://example.com/valid',
            'content_snippet' => 'Content',
            'source_publisher' => 'Publisher',
            'published_at' => now(),
            'business_id' => $business->id,
            'source_type' => 'business',
            'source_name' => $business->name,
            'metadata' => [],
        ],
    ];

    $this->serpApiMock
        ->shouldReceive('fetchNewsForBusiness')
        ->once()
        ->with($business)
        ->andReturn($mockNewsData);

    // This should not throw an exception
    $articles = $this->service->fetchNewsForBusiness($business, $region);

    expect($articles)->toHaveCount(1);
});
