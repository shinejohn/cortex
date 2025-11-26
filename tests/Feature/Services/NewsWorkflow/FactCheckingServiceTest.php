<?php

declare(strict_types=1);

use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\NewsFactCheck;
use App\Models\Region;
use App\Services\News\FactCheckingService;
use App\Services\News\PrismAiService;
use App\Services\News\ScrapingBeeService;
use Illuminate\Support\Facades\Config;
use Mockery;

beforeEach(function () {
    $this->prismAiMock = Mockery::mock(PrismAiService::class);
    $this->scrapingBeeMock = Mockery::mock(ScrapingBeeService::class);
    $this->service = new FactCheckingService($this->prismAiMock, $this->scrapingBeeMock);
});

it('processes drafts for fact-checking', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id, 'url' => 'https://example.com/article']);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'shortlisted',
    ]);

    $this->prismAiMock
        ->shouldReceive('generateOutline')
        ->once()
        ->andReturn([
            'title' => 'Test Article',
            'sections' => ['Introduction', 'Main Content', 'Conclusion'],
            'key_points' => ['Point 1', 'Point 2'],
        ]);

    $this->prismAiMock
        ->shouldReceive('extractClaimsForFactChecking')
        ->once()
        ->andReturn([
            'claims' => ['Test claim 1', 'Test claim 2'],
        ]);

    $this->scrapingBeeMock
        ->shouldReceive('searchForClaim')
        ->with('Test claim 1', Mockery::type('array'))
        ->once()
        ->andReturn([
            ['url' => 'https://example.com/article', 'claim_found' => true, 'evidence' => 'Evidence text', 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source2', 'claim_found' => true, 'evidence' => 'More evidence', 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source3', 'claim_found' => true, 'evidence' => 'Additional evidence', 'scraped_at' => now()->toIso8601String()],
        ]);

    $this->scrapingBeeMock
        ->shouldReceive('searchForClaim')
        ->with('Test claim 2', Mockery::type('array'))
        ->once()
        ->andReturn([
            ['url' => 'https://example.com/article', 'claim_found' => true, 'evidence' => 'Evidence text', 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source2', 'claim_found' => true, 'evidence' => 'More evidence', 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source3', 'claim_found' => true, 'evidence' => 'Additional evidence', 'scraped_at' => now()->toIso8601String()],
        ]);

    $count = $this->service->processForRegion($region);

    expect($count)->toBe(1);

    $draft->refresh();
    expect($draft->status)->toBe('ready_for_generation');
    expect($draft->outline)->not->toBeNull();
    expect(NewsFactCheck::count())->toBe(2);
});

it('returns zero when fact-checking is disabled', function () {
    Config::set('news-workflow.fact_checking.enabled', false);

    $region = Region::factory()->create();

    $this->prismAiMock->shouldNotReceive('generateOutline');
    $this->scrapingBeeMock->shouldNotReceive('searchForClaim');

    $count = $this->service->processForRegion($region);

    expect($count)->toBe(0);
});

it('generates outline for draft', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id, 'url' => 'https://example.com/article']);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'shortlisted',
        'topic_tags' => ['local', 'business'],
    ]);

    $this->prismAiMock
        ->shouldReceive('generateOutline')
        ->once()
        ->andReturn([
            'title' => 'Local Business Opens',
            'sections' => ['Background', 'Details', 'Impact'],
            'key_points' => ['New opening', 'Jobs created'],
        ]);

    $this->prismAiMock
        ->shouldReceive('extractClaimsForFactChecking')
        ->once()
        ->andReturn(['claims' => ['Test claim']]);

    $this->scrapingBeeMock
        ->shouldReceive('searchForClaim')
        ->with('Test claim', Mockery::type('array'))
        ->once()
        ->andReturn([
            ['url' => 'https://example.com/article', 'claim_found' => true, 'evidence' => 'Evidence', 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source2', 'claim_found' => true, 'evidence' => 'Evidence', 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source3', 'claim_found' => true, 'evidence' => 'Evidence', 'scraped_at' => now()->toIso8601String()],
        ]);

    $this->service->processForRegion($region);

    $draft->refresh();
    expect($draft->outline)->toContain('# Local Business Opens');
    expect($draft->outline)->toContain('## Background');
    expect($draft->outline)->toContain('## Key Points');
    expect($draft->status)->toBe('ready_for_generation');
});

it('creates fact-check records for verified claims', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id, 'url' => 'https://example.com/article']);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'shortlisted',
    ]);

    $this->prismAiMock
        ->shouldReceive('generateOutline')
        ->once()
        ->andReturn([
            'title' => 'Test',
            'sections' => ['Intro'],
            'key_points' => ['Point'],
        ]);

    $this->prismAiMock
        ->shouldReceive('extractClaimsForFactChecking')
        ->once()
        ->andReturn(['claims' => ['The business opened in 2024']]);

    $this->scrapingBeeMock
        ->shouldReceive('searchForClaim')
        ->once()
        ->with('The business opened in 2024', Mockery::type('array'))
        ->andReturn([
            ['url' => 'https://example.com/article', 'claim_found' => true, 'evidence' => 'The business opened in January 2024', 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source2', 'claim_found' => true, 'evidence' => 'Confirmed 2024 opening', 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source3', 'claim_found' => true, 'evidence' => 'Opened last year', 'scraped_at' => now()->toIso8601String()],
        ]);

    $this->service->processForRegion($region);

    expect(NewsFactCheck::count())->toBe(1);

    $factCheck = NewsFactCheck::first();
    expect($factCheck->draft_id)->toBe($draft->id);
    expect($factCheck->claim)->toBe('The business opened in 2024');
    expect($factCheck->verification_result)->toBe('verified');
    expect((float) $factCheck->confidence_score)->toBeGreaterThan(0.0);
});

it('marks claims as unverified when no evidence found', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id, 'url' => 'https://example.com/article']);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'shortlisted',
    ]);

    $this->prismAiMock
        ->shouldReceive('generateOutline')
        ->once()
        ->andReturn(['title' => 'Test', 'sections' => [], 'key_points' => []]);

    $this->prismAiMock
        ->shouldReceive('extractClaimsForFactChecking')
        ->once()
        ->andReturn(['claims' => ['Unverifiable claim']]);

    $this->scrapingBeeMock
        ->shouldReceive('searchForClaim')
        ->with('Unverifiable claim', Mockery::type('array'))
        ->once()
        ->andReturn([
            ['url' => 'https://example.com/article', 'claim_found' => false, 'evidence' => null, 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source2', 'claim_found' => false, 'evidence' => null, 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source3', 'claim_found' => false, 'evidence' => null, 'scraped_at' => now()->toIso8601String()],
        ]);

    $this->service->processForRegion($region);

    $factCheck = NewsFactCheck::first();
    expect($factCheck->verification_result)->toBe('contradicted');
    expect((float) $factCheck->confidence_score)->toBe(0.0);
});

it('calculates average fact-check confidence', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id, 'url' => 'https://example.com/article']);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'shortlisted',
    ]);

    $this->prismAiMock
        ->shouldReceive('generateOutline')
        ->once()
        ->andReturn(['title' => 'Test', 'sections' => [], 'key_points' => []]);

    $this->prismAiMock
        ->shouldReceive('extractClaimsForFactChecking')
        ->once()
        ->andReturn(['claims' => ['Claim 1', 'Claim 2']]);

    $this->scrapingBeeMock
        ->shouldReceive('searchForClaim')
        ->with('Claim 1', Mockery::type('array'))
        ->once()
        ->andReturn([
            ['url' => 'https://example.com/article', 'claim_found' => true, 'evidence' => 'Evidence', 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source2', 'claim_found' => true, 'evidence' => 'Evidence', 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source3', 'claim_found' => true, 'evidence' => 'Evidence', 'scraped_at' => now()->toIso8601String()],
        ]);

    $this->scrapingBeeMock
        ->shouldReceive('searchForClaim')
        ->with('Claim 2', Mockery::type('array'))
        ->once()
        ->andReturn([
            ['url' => 'https://example.com/article', 'claim_found' => false, 'evidence' => null, 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source2', 'claim_found' => false, 'evidence' => null, 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source3', 'claim_found' => false, 'evidence' => null, 'scraped_at' => now()->toIso8601String()],
        ]);

    $this->service->processForRegion($region);

    $draft->refresh();
    expect($draft->fact_check_confidence)->not->toBeNull();
    expect((float) $draft->fact_check_confidence)->toBeGreaterThan(0.0);
});

it('rejects drafts with low confidence scores', function () {
    Config::set('news-workflow.fact_checking.min_confidence_score', 80);

    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id, 'url' => 'https://example.com/article']);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'shortlisted',
    ]);

    $this->prismAiMock
        ->shouldReceive('generateOutline')
        ->once()
        ->andReturn(['title' => 'Test', 'sections' => [], 'key_points' => []]);

    $this->prismAiMock
        ->shouldReceive('extractClaimsForFactChecking')
        ->once()
        ->andReturn(['claims' => ['Low confidence claim']]);

    $this->scrapingBeeMock
        ->shouldReceive('searchForClaim')
        ->with('Low confidence claim', Mockery::type('array'))
        ->once()
        ->andReturn([
            ['url' => 'https://example.com/article', 'claim_found' => false, 'evidence' => null, 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source2', 'claim_found' => false, 'evidence' => null, 'scraped_at' => now()->toIso8601String()],
            ['url' => 'https://example.com/source3', 'claim_found' => false, 'evidence' => null, 'scraped_at' => now()->toIso8601String()],
        ]);

    $count = $this->service->processForRegion($region);

    expect($count)->toBe(0);

    $draft->refresh();
    expect($draft->status)->toBe('rejected');
    expect($draft->rejection_reason)->toContain('Fact-check confidence');
});

it('handles outline generation errors gracefully', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id]);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'shortlisted',
    ]);

    $this->prismAiMock
        ->shouldReceive('generateOutline')
        ->once()
        ->andThrow(new Exception('AI service unavailable'));

    $count = $this->service->processForRegion($region);

    expect($count)->toBe(0);

    $draft->refresh();
    expect($draft->status)->toBe('rejected');
    expect($draft->rejection_reason)->toContain('Fact-checking process failed');
});

it('handles claim verification errors gracefully', function () {
    $region = Region::factory()->create();
    $article = NewsArticle::factory()->create(['region_id' => $region->id, 'url' => 'https://example.com/article']);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $region->id,
        'status' => 'shortlisted',
    ]);

    $this->prismAiMock
        ->shouldReceive('generateOutline')
        ->once()
        ->andReturn(['title' => 'Test', 'sections' => [], 'key_points' => []]);

    $this->prismAiMock
        ->shouldReceive('extractClaimsForFactChecking')
        ->once()
        ->andReturn(['claims' => ['Claim that will fail']]);

    $this->scrapingBeeMock
        ->shouldReceive('searchForClaim')
        ->once()
        ->andThrow(new Exception('Scraping failed'));

    // Should not throw, should handle gracefully
    $this->service->processForRegion($region);

    $draft->refresh();
    // Draft should still be processed, just with no fact checks for failed claims
    expect($draft->status)->toBeIn(['rejected', 'ready_for_generation']);
});
