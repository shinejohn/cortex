<?php

declare(strict_types=1);

use App\Jobs\News\ProcessPhase3SelectionJob;
use App\Jobs\News\ProcessPhase4FactCheckingJob;
use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\Region;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->region = Region::factory()->create();
});

it('selects top articles based on relevance score', function () {
    // Create scored articles
    $article1 = NewsArticle::factory()->create([
        'region_id' => $this->region->id,
        'processed' => false,
        'relevance_score' => 95.0,
        'relevance_topic_tags' => ['events'],
        'scored_at' => now(),
    ]);

    $article2 = NewsArticle::factory()->create([
        'region_id' => $this->region->id,
        'processed' => false,
        'relevance_score' => 85.0,
        'relevance_topic_tags' => ['news'],
        'scored_at' => now(),
    ]);

    $article3 = NewsArticle::factory()->create([
        'region_id' => $this->region->id,
        'processed' => false,
        'relevance_score' => 50.0,
        'relevance_topic_tags' => ['other'],
        'scored_at' => now(),
    ]);

    config(['news-workflow.shortlisting.articles_per_region' => 2]);
    config(['news-workflow.shortlisting.min_relevance_score' => 60]);

    Queue::fake();

    $job = new ProcessPhase3SelectionJob($this->region);
    $job->handle();

    // Verify only top 2 articles were selected
    $drafts = NewsArticleDraft::where('region_id', $this->region->id)->get();
    expect($drafts)->toHaveCount(2);

    // Verify correct articles were selected
    expect($drafts->pluck('news_article_id')->toArray())->toContain($article1->id);
    expect($drafts->pluck('news_article_id')->toArray())->toContain($article2->id);
    expect($drafts->pluck('news_article_id')->toArray())->not->toContain($article3->id);

    // Verify all articles were marked as processed
    expect(NewsArticle::where('region_id', $this->region->id)->where('processed', false)->count())->toBe(0);

    // Verify Phase 4 was dispatched
    Queue::assertPushed(ProcessPhase4FactCheckingJob::class);
});

it('selects articles even if below min score when not enough qualified articles', function () {
    // Create articles where only 1 meets threshold
    $article1 = NewsArticle::factory()->create([
        'region_id' => $this->region->id,
        'processed' => false,
        'relevance_score' => 70.0,
        'relevance_topic_tags' => ['events'],
        'scored_at' => now(),
    ]);

    $article2 = NewsArticle::factory()->create([
        'region_id' => $this->region->id,
        'processed' => false,
        'relevance_score' => 50.0,
        'relevance_topic_tags' => ['news'],
        'scored_at' => now(),
    ]);

    $article3 = NewsArticle::factory()->create([
        'region_id' => $this->region->id,
        'processed' => false,
        'relevance_score' => 30.0,
        'relevance_topic_tags' => ['other'],
        'scored_at' => now(),
    ]);

    config(['news-workflow.shortlisting.articles_per_region' => 3]);
    config(['news-workflow.shortlisting.min_relevance_score' => 60]);

    Queue::fake();

    $job = new ProcessPhase3SelectionJob($this->region);
    $job->handle();

    // Verify all 3 articles were selected (even though 2 are below threshold)
    $drafts = NewsArticleDraft::where('region_id', $this->region->id)->get();
    expect($drafts)->toHaveCount(3);

    // Verify Phase 4 was dispatched
    Queue::assertPushed(ProcessPhase4FactCheckingJob::class);
});

it('handles case with no scored articles', function () {
    Queue::fake();

    $job = new ProcessPhase3SelectionJob($this->region);
    $job->handle();

    // Verify no drafts were created
    expect(NewsArticleDraft::where('region_id', $this->region->id)->count())->toBe(0);

    // Verify Phase 4 was still dispatched
    Queue::assertPushed(ProcessPhase4FactCheckingJob::class);
});

it('creates drafts with correct data', function () {
    $article = NewsArticle::factory()->create([
        'region_id' => $this->region->id,
        'processed' => false,
        'relevance_score' => 85.5,
        'relevance_topic_tags' => ['events', 'downtown'],
        'scored_at' => now(),
    ]);

    config(['news-workflow.shortlisting.articles_per_region' => 1]);

    Queue::fake();

    $job = new ProcessPhase3SelectionJob($this->region);
    $job->handle();

    // Verify draft was created with correct data
    $draft = NewsArticleDraft::where('region_id', $this->region->id)->first();
    expect($draft)->not->toBeNull();
    expect($draft->news_article_id)->toBe($article->id);
    expect($draft->status)->toBe('shortlisted');
    expect((float) $draft->relevance_score)->toBe(85.5);
    expect($draft->topic_tags)->toBe(['events', 'downtown']);

    // Verify article was marked as processed
    $article->refresh();
    expect($article->processed)->toBeTrue();
});

it('marks all articles as processed even unselected ones', function () {
    // Create 5 articles but only select top 2
    $articles = NewsArticle::factory()->count(5)->create([
        'region_id' => $this->region->id,
        'processed' => false,
        'scored_at' => now(),
    ]);

    // Set different scores
    $articles[0]->update(['relevance_score' => 90.0]);
    $articles[1]->update(['relevance_score' => 80.0]);
    $articles[2]->update(['relevance_score' => 70.0]);
    $articles[3]->update(['relevance_score' => 60.0]);
    $articles[4]->update(['relevance_score' => 50.0]);

    config(['news-workflow.shortlisting.articles_per_region' => 2]);

    Queue::fake();

    $job = new ProcessPhase3SelectionJob($this->region);
    $job->handle();

    // Verify only 2 drafts created
    expect(NewsArticleDraft::where('region_id', $this->region->id)->count())->toBe(2);

    // Verify ALL articles marked as processed
    expect(NewsArticle::where('region_id', $this->region->id)->where('processed', false)->count())->toBe(0);
    expect(NewsArticle::where('region_id', $this->region->id)->where('processed', true)->count())->toBe(5);
});
