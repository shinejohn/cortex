<?php

declare(strict_types=1);

use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\NewsFactCheck;
use App\Models\Region;
use App\Services\News\ArticleGenerationService;
use App\Services\News\PrismAiService;
use App\Services\News\UnsplashService;
use Illuminate\Support\Facades\Config;

beforeEach(function () {
    // Create anonymous classes that extend the final classes for testing
    $this->prismAiMock = Mockery::mock(PrismAiService::class)->makePartial();
    $this->unsplashMock = Mockery::mock(UnsplashService::class)->makePartial();

    // Make Unsplash return null by default (no image)
    $this->unsplashMock->shouldReceive('searchImage')->andReturn(null)->byDefault();
    $this->unsplashMock->shouldReceive('getRandomImage')->andReturn(null)->byDefault();

    $this->service = new ArticleGenerationService($this->prismAiMock, $this->unsplashMock);
});

it('generates articles for drafts ready for generation', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForGeneration()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
    ]);

    // Create verified fact checks
    NewsFactCheck::factory()->create([
        'draft_id' => $draft->id,
        'verification_result' => 'verified',
        'confidence_score' => 90,
    ]);

    $this->prismAiMock
        ->shouldReceive('generateFinalArticle')
        ->once()
        ->andReturn([
            'title' => 'Generated Article Title',
            'content' => '<p>Full article content with HTML formatting.</p>',
            'excerpt' => 'Brief excerpt of the article',
            'seo_keywords' => ['local', 'news', 'community'],
        ]);

    $count = $this->service->generateArticles($region);

    expect($count)->toBe(1);

    $draft->refresh();
    expect($draft->status)->toBe('ready_for_publishing');
    expect($draft->generated_title)->toBe('Generated Article Title');
    expect($draft->generated_content)->toContain('Full article content');
    expect($draft->generated_excerpt)->toBe('Brief excerpt of the article');
    expect($draft->seo_metadata)->not->toBeNull();
    expect($draft->seo_metadata['slug'])->toBe('generated-article-title');
});

it('returns zero when article generation is disabled', function () {
    Config::set('news-workflow.article_generation.enabled', false);

    $region = Region::factory()->create();

    $this->prismAiMock->shouldNotReceive('generateFinalArticle');

    $count = $this->service->generateArticles($region);

    expect($count)->toBe(0);
});

it('generates SEO metadata correctly', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForGeneration()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'topic_tags' => ['business', 'local'],
    ]);

    $this->prismAiMock
        ->shouldReceive('generateFinalArticle')
        ->once()
        ->andReturn([
            'title' => 'New Business Opens Downtown',
            'content' => '<p>A new local business has opened its doors downtown, bringing fresh opportunities to the community.</p>',
            'excerpt' => 'New business brings opportunities',
            'seo_keywords' => ['downtown', 'opportunities'],
        ]);

    $this->service->generateArticles($region);

    $draft->refresh();
    expect($draft->seo_metadata)->toHaveKeys(['meta_description', 'slug', 'keywords', 'og_title', 'og_description']);
    expect($draft->seo_metadata['slug'])->toBe('new-business-opens-downtown');
    expect($draft->seo_metadata['keywords'])->toContain('business');
    expect($draft->seo_metadata['keywords'])->toContain('downtown');
});

it('includes verified fact checks in article generation', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForGeneration()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
    ]);

    NewsFactCheck::factory()->create([
        'draft_id' => $draft->id,
        'claim' => 'Business opened in 2024',
        'verification_result' => 'verified',
        'confidence_score' => 95,
    ]);

    NewsFactCheck::factory()->create([
        'draft_id' => $draft->id,
        'claim' => 'Some unverified claim',
        'verification_result' => 'unverified',
        'confidence_score' => 30,
    ]);

    $this->prismAiMock
        ->shouldReceive('generateFinalArticle')
        ->once()
        ->withArgs(function ($draftData, $factChecks) {
            return is_array($draftData) &&
                   count($factChecks) === 1 &&
                   $factChecks[0]['claim'] === 'Business opened in 2024';
        })
        ->andReturn([
            'title' => 'Article Title',
            'content' => '<p>Content</p>',
            'excerpt' => 'Excerpt',
            'seo_keywords' => [],
        ]);

    $this->service->generateArticles($region);
});

it('handles article generation errors gracefully', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForGeneration()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
    ]);

    $this->prismAiMock
        ->shouldReceive('generateFinalArticle')
        ->once()
        ->andThrow(new Exception('AI generation failed'));

    $count = $this->service->generateArticles($region);

    expect($count)->toBe(0);

    $draft->refresh();
    expect($draft->status)->toBe('rejected');
    expect($draft->rejection_reason)->toContain('Article generation failed');
});

it('processes multiple drafts in one region', function () {
    $region = Region::factory()->create();

    foreach (range(1, 3) as $i) {
        $article = NewsArticle::factory()->create(['region_id' => $region->id]);
        NewsArticleDraft::factory()->readyForGeneration()->create([
            'news_article_id' => $article->id,
            'region_id' => $region->id,
        ]);
    }

    $this->prismAiMock
        ->shouldReceive('generateFinalArticle')
        ->times(3)
        ->andReturn([
            'title' => 'Generated Title',
            'content' => '<p>Content</p>',
            'excerpt' => 'Excerpt',
            'seo_keywords' => [],
        ]);

    $count = $this->service->generateArticles($region);

    expect($count)->toBe(3);
    expect(NewsArticleDraft::where('status', 'ready_for_publishing')->count())->toBe(3);
});

it('only processes drafts in selected_for_generation status', function () {
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
    ]);

    NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
    ]);

    $this->prismAiMock
        ->shouldReceive('generateFinalArticle')
        ->once()
        ->andReturn([
            'title' => 'Title',
            'content' => '<p>Content</p>',
            'excerpt' => 'Excerpt',
            'seo_keywords' => [],
        ]);

    $count = $this->service->generateArticles($region);

    expect($count)->toBe(1);
});

it('generates proper slug from title with special characters', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->readyForGeneration()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
    ]);

    $this->prismAiMock
        ->shouldReceive('generateFinalArticle')
        ->once()
        ->andReturn([
            'title' => 'New Café Opens: "Best Coffee" in Town!',
            'content' => '<p>Content</p>',
            'excerpt' => 'Excerpt',
            'seo_keywords' => [],
        ]);

    $this->service->generateArticles($region);

    $draft->refresh();
    expect($draft->seo_metadata['slug'])->toBe('new-caf-opens-best-coffee-in-town');
});
