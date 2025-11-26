<?php

declare(strict_types=1);

use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\Region;
use App\Services\News\ContentCurationService;
use App\Services\News\PrismAiService;
use Illuminate\Support\Facades\Config;
use Mockery;

beforeEach(function () {
    $this->prismAiMock = Mockery::mock(PrismAiService::class);
    $this->service = new ContentCurationService($this->prismAiMock);
});

it('shortlists articles for a region', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create([
        'region_id' => $region->id,
        'processed' => false,
    ]);

    $this->prismAiMock
        ->shouldReceive('scoreArticleRelevance')
        ->once()
        ->andReturn([
            'relevance_score' => 85,
            'topic_tags' => ['local', 'business'],
            'rationale' => 'Highly relevant local business news',
        ]);

    $count = $this->service->shortlistArticles($region);

    expect($count)->toBe(1);
    expect(NewsArticleDraft::count())->toBe(1);

    $draft = NewsArticleDraft::first();
    expect($draft->news_article_id)->toBe($article->id);
    expect($draft->status)->toBe('shortlisted');
    expect((float) $draft->relevance_score)->toBe(85.0);
    expect($draft->topic_tags)->toBe(['local', 'business']);

    $article->refresh();
    expect($article->processed)->toBeTrue();
});

it('returns zero when shortlisting is disabled', function () {
    Config::set('news-workflow.shortlisting.enabled', false);

    $region = Region::factory()->create();
    NewsArticle::factory()->create([
        'region_id' => $region->id,
        'processed' => false,
    ]);

    $this->prismAiMock->shouldNotReceive('scoreArticleRelevance');

    $count = $this->service->shortlistArticles($region);

    expect($count)->toBe(0);
    expect(NewsArticleDraft::count())->toBe(0);
});

it('filters articles by minimum relevance score', function () {
    Config::set('news-workflow.shortlisting.min_relevance_score', 70);

    $region = Region::factory()->create();
    $article1 = NewsArticle::factory()->create(['region_id' => $region->id, 'processed' => false]);
    $article2 = NewsArticle::factory()->create(['region_id' => $region->id, 'processed' => false]);

    $this->prismAiMock
        ->shouldReceive('scoreArticleRelevance')
        ->twice()
        ->andReturn(
            ['relevance_score' => 85, 'topic_tags' => ['local'], 'rationale' => 'Good'],
            ['relevance_score' => 50, 'topic_tags' => ['general'], 'rationale' => 'Poor']
        );

    $count = $this->service->shortlistArticles($region);

    expect($count)->toBe(1);
    expect(NewsArticleDraft::count())->toBe(1);

    $draft = NewsArticleDraft::first();
    expect($draft->news_article_id)->toBe($article1->id);
    expect((float) $draft->relevance_score)->toBe(85.0);
});

it('limits shortlisted articles to configured count', function () {
    Config::set('news-workflow.shortlisting.articles_per_region', 2);

    $region = Region::factory()->create();
    NewsArticle::factory()->count(5)->create(['region_id' => $region->id, 'processed' => false]);

    $this->prismAiMock
        ->shouldReceive('scoreArticleRelevance')
        ->times(5)
        ->andReturn(
            ['relevance_score' => 90, 'topic_tags' => [], 'rationale' => ''],
            ['relevance_score' => 85, 'topic_tags' => [], 'rationale' => ''],
            ['relevance_score' => 80, 'topic_tags' => [], 'rationale' => ''],
            ['relevance_score' => 75, 'topic_tags' => [], 'rationale' => ''],
            ['relevance_score' => 70, 'topic_tags' => [], 'rationale' => '']
        );

    $count = $this->service->shortlistArticles($region);

    expect($count)->toBe(2);
    expect(NewsArticleDraft::count())->toBe(2);

    $drafts = NewsArticleDraft::orderBy('relevance_score', 'desc')->get();
    expect((float) $drafts[0]->relevance_score)->toBe(90.0);
    expect((float) $drafts[1]->relevance_score)->toBe(85.0);
});

it('marks all articles as processed after shortlisting', function () {
    $region = Region::factory()->create();
    NewsArticle::factory()->count(3)->create(['region_id' => $region->id, 'processed' => false]);

    $this->prismAiMock
        ->shouldReceive('scoreArticleRelevance')
        ->times(3)
        ->andReturn(
            ['relevance_score' => 85, 'topic_tags' => [], 'rationale' => ''],
            ['relevance_score' => 40, 'topic_tags' => [], 'rationale' => ''],
            ['relevance_score' => 30, 'topic_tags' => [], 'rationale' => '']
        );

    $this->service->shortlistArticles($region);

    expect(NewsArticle::where('processed', false)->count())->toBe(0);
    expect(NewsArticle::where('processed', true)->count())->toBe(3);
});

it('performs final selection of drafts', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
        'outline' => '# Test Outline',
        'relevance_score' => 85,
        'fact_check_confidence' => 80,
    ]);

    $this->prismAiMock
        ->shouldReceive('evaluateDraftQuality')
        ->once()
        ->andReturn([
            'quality_score' => 88,
            'fact_check_confidence' => 82,
            'strengths' => ['Well structured'],
            'weaknesses' => [],
        ]);

    $count = $this->service->finalSelection($region);

    expect($count)->toBe(1);

    $draft->refresh();
    expect($draft->status)->toBe('ready_for_publishing');
    expect((float) $draft->quality_score)->toBe(88.0);
});

it('returns zero when final selection is disabled', function () {
    Config::set('news-workflow.final_selection.enabled', false);

    $region = Region::factory()->create();

    $this->prismAiMock->shouldNotReceive('evaluateDraftQuality');

    $count = $this->service->finalSelection($region);

    expect($count)->toBe(0);
});

it('filters drafts by minimum quality score', function () {
    Config::set('news-workflow.final_selection.min_quality_score', 80);

    $region = Region::factory()->create();
    $article1 = NewsArticle::factory()->create(['region_id' => $region->id]);
    $article2 = NewsArticle::factory()->create(['region_id' => $region->id]);

    $draft1 = NewsArticleDraft::factory()->create([
        'news_article_id' => $article1->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
        'outline' => '# Test',
    ]);

    $draft2 = NewsArticleDraft::factory()->create([
        'news_article_id' => $article2->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
        'outline' => '# Test',
    ]);

    $this->prismAiMock
        ->shouldReceive('evaluateDraftQuality')
        ->twice()
        ->andReturn(
            ['quality_score' => 90, 'fact_check_confidence' => 85, 'strengths' => [], 'weaknesses' => []],
            ['quality_score' => 70, 'fact_check_confidence' => 75, 'strengths' => [], 'weaknesses' => []]
        );

    $count = $this->service->finalSelection($region);

    expect($count)->toBe(1);

    $draft1->refresh();
    $draft2->refresh();
    expect($draft1->status)->toBe('ready_for_publishing');
    expect($draft2->status)->toBe('rejected');
    expect($draft2->rejection_reason)->toContain('Did not meet quality threshold');
});

it('limits final selection to configured count', function () {
    Config::set('news-workflow.final_selection.articles_per_region', 2);

    $region = Region::factory()->create();

    foreach (range(1, 4) as $i) {
        $article = NewsArticle::factory()->create(['region_id' => $region->id]);
        NewsArticleDraft::factory()->create([
            'news_article_id' => $article->id,
            'region_id' => $region->id,
            'status' => 'ready_for_generation',
            'outline' => '# Test',
        ]);
    }

    $this->prismAiMock
        ->shouldReceive('evaluateDraftQuality')
        ->times(4)
        ->andReturn(
            ['quality_score' => 95, 'fact_check_confidence' => 90, 'strengths' => [], 'weaknesses' => []],
            ['quality_score' => 88, 'fact_check_confidence' => 85, 'strengths' => [], 'weaknesses' => []],
            ['quality_score' => 82, 'fact_check_confidence' => 80, 'strengths' => [], 'weaknesses' => []],
            ['quality_score' => 78, 'fact_check_confidence' => 75, 'strengths' => [], 'weaknesses' => []]
        );

    $count = $this->service->finalSelection($region);

    expect($count)->toBe(2);
    expect(NewsArticleDraft::where('status', 'ready_for_publishing')->count())->toBe(2);
    expect(NewsArticleDraft::where('status', 'rejected')->count())->toBe(2);
});

it('rejects drafts that fail quality evaluation', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'ready_for_generation',
        'outline' => '# Test',
    ]);

    $this->prismAiMock
        ->shouldReceive('evaluateDraftQuality')
        ->once()
        ->andThrow(new Exception('AI evaluation failed'));

    $count = $this->service->finalSelection($region);

    expect($count)->toBe(0);

    $draft->refresh();
    expect($draft->status)->toBe('rejected');
    expect($draft->rejection_reason)->toContain('Failed quality evaluation');
});
