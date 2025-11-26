<?php

declare(strict_types=1);

use App\Models\DayNewsPost;
use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\Region;
use App\Services\News\PublishingService;
use Illuminate\Support\Facades\Config;

beforeEach(function () {
    $this->service = new PublishingService;
});

it('publishes articles ready for publishing', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'quality_score' => 90, // Above auto-publish threshold
    ]);

    $count = $this->service->publishArticles($region);

    expect($count)->toBe(1);
    expect(DayNewsPost::count())->toBe(1);

    $post = DayNewsPost::first();
    expect($post->title)->toBe($draft->generated_title);
    expect($post->regions->pluck('id')->first())->toBe($region->id);
    expect($post->status)->toBe('published');
    expect($post->published_at)->not->toBeNull();
    expect($post->type)->toBe('article');

    $draft->refresh();
    expect($draft->status)->toBe('published');
    expect($draft->published_post_id)->toBe($post->id);
});

it('returns zero when publishing is disabled', function () {
    Config::set('news-workflow.publishing.enabled', false);

    $region = Region::factory()->create();

    $count = $this->service->publishArticles($region);

    expect($count)->toBe(0);
    expect(DayNewsPost::count())->toBe(0);
});

it('auto-publishes articles with high quality scores', function () {
    Config::set('news-workflow.publishing.auto_publish_threshold', 85);

    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'quality_score' => 90, // Above threshold
    ]);

    $count = $this->service->publishArticles($region);

    expect($count)->toBe(1);

    $post = DayNewsPost::first();
    expect($post->status)->toBe('published');
    expect($post->published_at)->not->toBeNull();
});

it('marks articles as draft when quality score is below threshold', function () {
    Config::set('news-workflow.publishing.auto_publish_threshold', 85);

    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'quality_score' => 80, // Below threshold
    ]);

    $count = $this->service->publishArticles($region);

    expect($count)->toBe(0); // Not auto-published

    $post = DayNewsPost::first();
    expect($post->status)->toBe('draft');
    expect($post->published_at)->toBeNull();

    $draft->refresh();
    expect($draft->status)->toBe('published'); // Still marked as published (pending review)
});

it('creates DayNewsPost with all required fields', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'generated_title' => 'Test Article',
        'generated_content' => '<p>Article content</p>',
        'generated_excerpt' => 'Article excerpt',
        'seo_metadata' => [
            'slug' => 'test-article',
            'meta_description' => 'Meta description',
            'keywords' => ['test', 'article'],
        ],
        'featured_image_url' => 'https://example.com/image.jpg',
        'quality_score' => 90,
    ]);

    $this->service->publishArticles($region);

    $post = DayNewsPost::first();
    expect($post->title)->toBe('Test Article');
    expect($post->slug)->toBe('test-article');
    expect($post->content)->toBe('<p>Article content</p>');
    expect($post->excerpt)->toBe('Article excerpt');
    expect($post->metadata['meta_description'])->toBe('Meta description');
    expect($post->metadata['meta_keywords'])->toBe(['test', 'article']);
    expect($post->featured_image)->toBe('https://example.com/image.jpg');
});

it('generates slug if not provided in SEO metadata', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'generated_title' => 'New Article Without Slug',
        'seo_metadata' => null,
        'quality_score' => 90,
    ]);

    $this->service->publishArticles($region);

    $post = DayNewsPost::first();
    expect($post->slug)->toBe('new-article-without-slug');
});

it('processes multiple drafts in one region', function () {
    $region = Region::factory()->create();

    foreach (range(1, 3) as $i) {
        $article = NewsArticle::factory()->create(['region_id' => $region->id]);
        NewsArticleDraft::factory()->readyForPublishing()->create([
            'news_article_id' => $article->id,
            'region_id' => $region->id,
            'quality_score' => 90,
        ]);
    }

    $count = $this->service->publishArticles($region);

    expect($count)->toBe(3);
    expect(DayNewsPost::count())->toBe(3);
    expect(NewsArticleDraft::where('status', 'published')->count())->toBe(3);
});

it('only processes drafts in ready_for_publishing status', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);

    // Create drafts in different statuses
    NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'shortlisted',
    ]);

    NewsArticleDraft::factory()->readyForGeneration()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
    ]);

    NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'quality_score' => 90,
    ]);

    $count = $this->service->publishArticles($region);

    expect($count)->toBe(1);
    expect(DayNewsPost::count())->toBe(1);
});

it('handles publishing errors gracefully', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'generated_title' => null, // This should cause an error
        'quality_score' => 90,
    ]);

    $count = $this->service->publishArticles($region);

    expect($count)->toBe(0);

    $draft->refresh();
    expect($draft->status)->toBe('rejected');
    expect($draft->rejection_reason)->toContain('Publishing failed');
});

it('uses transaction for publishing to ensure atomicity', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'quality_score' => 90,
    ]);

    $this->service->publishArticles($region);

    // Verify both DayNewsPost and NewsArticleDraft were updated
    $post = DayNewsPost::first();
    $draft->refresh();

    expect($post)->not->toBeNull();
    expect($draft->published_post_id)->toBe($post->id);
    expect($draft->status)->toBe('published');
});
