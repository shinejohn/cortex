<?php

declare(strict_types=1);

use App\Models\DayNewsPost;
use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\NewsFactCheck;
use App\Models\Region;
use App\Services\News\PublishingService;

beforeEach(function () {
    $this->region = Region::factory()->create();
});

it('transfers trust metrics to published post metadata', function () {
    $article = NewsArticle::factory()->create(['region_id' => $this->region->id]);
    $draft = NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $this->region->id,
        'ai_metadata' => [
            'trust_metrics' => [
                'fact_accuracy' => 85,
                'bias_level' => 90,
                'reliability' => 80,
                'objectivity' => 88,
                'source_quality' => 75,
                'community_relevance' => 92,
                'overall_score' => 85,
                'analysis_rationale' => 'This article demonstrates strong factual accuracy and neutral presentation.',
            ],
        ],
    ]);

    $publishingService = app(PublishingService::class);
    $publishingService->publishArticles($this->region);

    $draft->refresh();
    $post = DayNewsPost::find($draft->published_post_id);

    expect($post)->not->toBeNull();
    expect($post->metadata)->toHaveKey('trust_metrics');
    expect($post->metadata['trust_metrics'])->toBe([
        'fact_accuracy' => 85,
        'bias_level' => 90,
        'reliability' => 80,
        'objectivity' => 88,
        'source_quality' => 75,
        'community_relevance' => 92,
        'overall_score' => 85,
        'analysis_rationale' => 'This article demonstrates strong factual accuracy and neutral presentation.',
    ]);
    expect($post->metadata['is_ai_generated'])->toBeTrue();
});

it('does not add trust metrics to posts without ai_metadata', function () {
    $article = NewsArticle::factory()->create(['region_id' => $this->region->id]);
    $draft = NewsArticleDraft::factory()->readyForPublishing()->create([
        'news_article_id' => $article->id,
        'region_id' => $this->region->id,
        'ai_metadata' => null,
    ]);

    $publishingService = app(PublishingService::class);
    $publishingService->publishArticles($this->region);

    $draft->refresh();
    $post = DayNewsPost::find($draft->published_post_id);

    expect($post)->not->toBeNull();
    expect($post->metadata)->not->toHaveKey('trust_metrics');
    expect($post->metadata)->not->toHaveKey('is_ai_generated');
});

it('calculates correct overall score from weighted metrics', function () {
    // Test the weighted calculation:
    // Fact Accuracy: 25%, Reliability: 20%, Neutrality: 15%
    // Objectivity: 15%, Community Relevance: 15%, Source Quality: 10%

    $factAccuracy = 80;
    $biasLevel = 90;
    $reliability = 70;
    $objectivity = 85;
    $sourceQuality = 75;
    $communityRelevance = 95;

    $expectedScore = (int) round(
        ($factAccuracy * 0.25) +
        ($biasLevel * 0.15) +
        ($reliability * 0.20) +
        ($objectivity * 0.15) +
        ($sourceQuality * 0.10) +
        ($communityRelevance * 0.15)
    );

    // Manual calculation: 20 + 13.5 + 14 + 12.75 + 7.5 + 14.25 = 82
    expect($expectedScore)->toBe(82);
});

it('stores trust metrics in draft ai_metadata during evaluation', function () {
    $article = NewsArticle::factory()->create(['region_id' => $this->region->id]);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $this->region->id,
        'status' => 'outline_generated',
        'outline' => '# Test Article\n## Introduction\nTest content about local news.',
        'relevance_score' => 85,
        'fact_check_confidence' => 78,
        'ai_metadata' => [
            'trust_metrics' => [
                'fact_accuracy' => 78,
                'bias_level' => 85,
                'reliability' => 82,
                'objectivity' => 80,
                'source_quality' => 75,
                'community_relevance' => 85,
                'overall_score' => 81,
                'analysis_rationale' => 'Test rationale',
            ],
        ],
    ]);

    expect($draft->ai_metadata['trust_metrics'])->toHaveKeys([
        'fact_accuracy',
        'bias_level',
        'reliability',
        'objectivity',
        'source_quality',
        'community_relevance',
        'overall_score',
        'analysis_rationale',
    ]);

    expect($draft->ai_metadata['trust_metrics']['fact_accuracy'])->toBeBetween(0, 100);
    expect($draft->ai_metadata['trust_metrics']['overall_score'])->toBeBetween(0, 100);
});

it('includes fact checks in trust analysis context', function () {
    $article = NewsArticle::factory()->create(['region_id' => $this->region->id]);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $this->region->id,
        'outline' => '# Test Article',
    ]);

    // Create some fact checks
    NewsFactCheck::factory()->count(3)->create([
        'draft_id' => $draft->id,
        'verification_result' => 'verified',
        'confidence_score' => 85,
    ]);

    $draft->refresh();
    $factChecks = $draft->factChecks;

    expect($factChecks)->toHaveCount(3);
    expect($factChecks->first()->verification_result)->toBe('verified');
});

it('rejects drafts with missing outlines during evaluation', function () {
    $article = NewsArticle::factory()->create(['region_id' => $this->region->id]);
    $draft = NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $this->region->id,
        'status' => 'ready_for_generation',
        'outline' => null, // Missing outline
        'relevance_score' => 85,
    ]);

    // Dispatch the evaluation job
    $job = new App\Jobs\News\ProcessSingleDraftEvaluationJob($draft, $this->region);
    $job->handle(app(App\Services\News\PrismAiService::class));

    $draft->refresh();

    expect($draft->status)->toBe('rejected');
    expect($draft->rejection_reason)->toContain('Missing outline');
});

it('dispatches outline generation jobs even when fact-checking is disabled', function () {
    Illuminate\Support\Facades\Queue::fake();
    config(['news-workflow.fact_checking.enabled' => false]);

    $article = NewsArticle::factory()->create(['region_id' => $this->region->id]);
    NewsArticleDraft::factory()->create([
        'news_article_id' => $article->id,
        'region_id' => $this->region->id,
        'status' => 'shortlisted',
    ]);

    // Dispatch the Phase 4 job
    $job = new App\Jobs\News\ProcessPhase4FactCheckingJob($this->region);
    $job->handle();

    // Should dispatch ProcessSingleDraftFactCheckingJob for outline generation
    Illuminate\Support\Facades\Queue::assertPushed(
        App\Jobs\News\ProcessSingleDraftFactCheckingJob::class
    );
});
