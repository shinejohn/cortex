<?php

declare(strict_types=1);

use App\Models\Region;
use App\Services\News\ArticleGenerationService;
use App\Services\News\BusinessDiscoveryService;
use App\Services\News\ContentCurationService;
use App\Services\News\FactCheckingService;
use App\Services\News\NewsCollectionService;
use App\Services\News\NewsWorkflowService;
use App\Services\News\PublishingService;

beforeEach(function () {
    $this->businessDiscoveryMock = Mockery::mock(BusinessDiscoveryService::class);
    $this->newsCollectionMock = Mockery::mock(NewsCollectionService::class);
    $this->contentCurationMock = Mockery::mock(ContentCurationService::class);
    $this->factCheckingMock = Mockery::mock(FactCheckingService::class);
    $this->articleGenerationMock = Mockery::mock(ArticleGenerationService::class);
    $this->publishingMock = Mockery::mock(PublishingService::class);

    $this->service = new NewsWorkflowService(
        $this->businessDiscoveryMock,
        $this->newsCollectionMock,
        $this->contentCurationMock,
        $this->factCheckingMock,
        $this->articleGenerationMock,
        $this->publishingMock
    );
});

it('runs complete workflow for a region', function () {
    $region = Region::factory()->create(['name' => 'Test Region']);

    // Mock all service calls including business discovery
    $this->businessDiscoveryMock->shouldReceive('discoverBusinesses')->with($region)->once()->andReturn(5);
    $this->newsCollectionMock->shouldReceive('collectNews')->with($region)->once()->andReturn(10);
    $this->contentCurationMock->shouldReceive('shortlistArticles')->with($region)->once()->andReturn(5);
    $this->factCheckingMock->shouldReceive('processForRegion')->with($region)->once()->andReturn(5);
    $this->contentCurationMock->shouldReceive('finalSelection')->with($region)->once()->andReturn(3);
    $this->articleGenerationMock->shouldReceive('generateArticles')->with($region)->once()->andReturn(3);
    $this->publishingMock->shouldReceive('publishArticles')->with($region)->once()->andReturn(2);

    $results = $this->service->runWorkflowForRegion($region);

    expect($results['region'])->toBe('Test Region');
    expect($results['phases']['business_discovery'])->toBe(5);
    expect($results['phases']['news_collection'])->toBe(10);
    expect($results['phases']['shortlisting'])->toBe(5);
    expect($results['phases']['fact_checking'])->toBe(5);
    expect($results['phases']['final_selection'])->toBe(3);
    expect($results['phases']['article_generation'])->toBe(3);
    expect($results['phases']['publishing'])->toBe(2);
});

it('runs daily workflow for a region without business discovery', function () {
    $region = Region::factory()->create(['name' => 'Test Region']);

    // Mock all service calls except business discovery
    $this->businessDiscoveryMock->shouldNotReceive('discoverBusinesses');
    $this->newsCollectionMock->shouldReceive('collectNews')->with($region)->once()->andReturn(10);
    $this->contentCurationMock->shouldReceive('shortlistArticles')->with($region)->once()->andReturn(5);
    $this->factCheckingMock->shouldReceive('processForRegion')->with($region)->once()->andReturn(5);
    $this->contentCurationMock->shouldReceive('finalSelection')->with($region)->once()->andReturn(3);
    $this->articleGenerationMock->shouldReceive('generateArticles')->with($region)->once()->andReturn(3);
    $this->publishingMock->shouldReceive('publishArticles')->with($region)->once()->andReturn(2);

    $results = $this->service->runDailyWorkflowForRegion($region);

    expect($results['region'])->toBe('Test Region');
    expect($results['phases'])->not->toHaveKey('business_discovery');
    expect($results['phases']['news_collection'])->toBe(10);
    expect($results['phases']['publishing'])->toBe(2);
});

it('runs complete workflow for all regions', function () {
    Region::factory()->count(2)->create();

    // Mock service calls for any region (will be called twice)
    $this->businessDiscoveryMock->shouldReceive('discoverBusinesses')->with(Mockery::type(Region::class))->twice()->andReturn(5);
    $this->newsCollectionMock->shouldReceive('collectNews')->with(Mockery::type(Region::class))->twice()->andReturn(10);
    $this->contentCurationMock->shouldReceive('shortlistArticles')->with(Mockery::type(Region::class))->twice()->andReturn(5);
    $this->factCheckingMock->shouldReceive('processForRegion')->with(Mockery::type(Region::class))->twice()->andReturn(5);
    $this->contentCurationMock->shouldReceive('finalSelection')->with(Mockery::type(Region::class))->twice()->andReturn(3);
    $this->articleGenerationMock->shouldReceive('generateArticles')->with(Mockery::type(Region::class))->twice()->andReturn(3);
    $this->publishingMock->shouldReceive('publishArticles')->with(Mockery::type(Region::class))->twice()->andReturn(2);

    $results = $this->service->runCompleteWorkflow();

    expect($results['total_regions'])->toBe(2);
    expect($results['successful_regions'])->toBe(2);
    expect($results['failed_regions'])->toBe(0);
    expect($results['phases']['business_discovery'])->toBe(10); // 5 per region
    expect($results['phases']['news_collection'])->toBe(20); // 10 per region
    expect($results['phases']['publishing'])->toBe(4); // 2 per region
    expect($results['errors'])->toBeEmpty();
});

it('runs daily workflow for all regions', function () {
    Region::factory()->count(2)->create();

    // Mock service calls for any region (will be called twice)
    $this->newsCollectionMock->shouldReceive('collectNews')->with(Mockery::type(Region::class))->twice()->andReturn(8);
    $this->contentCurationMock->shouldReceive('shortlistArticles')->with(Mockery::type(Region::class))->twice()->andReturn(4);
    $this->factCheckingMock->shouldReceive('processForRegion')->with(Mockery::type(Region::class))->twice()->andReturn(4);
    $this->contentCurationMock->shouldReceive('finalSelection')->with(Mockery::type(Region::class))->twice()->andReturn(2);
    $this->articleGenerationMock->shouldReceive('generateArticles')->with(Mockery::type(Region::class))->twice()->andReturn(2);
    $this->publishingMock->shouldReceive('publishArticles')->with(Mockery::type(Region::class))->twice()->andReturn(1);

    $results = $this->service->runDailyWorkflow();

    expect($results['total_regions'])->toBe(2);
    expect($results['successful_regions'])->toBe(2);
    expect($results['failed_regions'])->toBe(0);
    expect($results['phases'])->not->toHaveKey('business_discovery');
    expect($results['phases']['news_collection'])->toBe(16); // 8 per region
    expect($results['phases']['publishing'])->toBe(2); // 1 per region
});

it('handles errors gracefully in workflow', function () {
    Region::factory()->create(['name' => 'Working Region']);
    Region::factory()->create(['name' => 'Failing Region']);

    // Mock successful workflow for first region, failed for second
    $this->newsCollectionMock->shouldReceive('collectNews')->with(Mockery::type(Region::class))->once()->andReturn(10);
    $this->contentCurationMock->shouldReceive('shortlistArticles')->with(Mockery::type(Region::class))->once()->andReturn(5);
    $this->factCheckingMock->shouldReceive('processForRegion')->with(Mockery::type(Region::class))->once()->andReturn(5);
    $this->contentCurationMock->shouldReceive('finalSelection')->with(Mockery::type(Region::class))->once()->andReturn(3);
    $this->articleGenerationMock->shouldReceive('generateArticles')->with(Mockery::type(Region::class))->once()->andReturn(3);
    $this->publishingMock->shouldReceive('publishArticles')->with(Mockery::type(Region::class))->once()->andReturn(2);

    // Mock failed workflow for second region
    $this->newsCollectionMock->shouldReceive('collectNews')
        ->with(Mockery::type(Region::class))
        ->once()
        ->andThrow(new Exception('News collection failed'));

    $results = $this->service->runDailyWorkflow();

    expect($results['total_regions'])->toBe(2);
    expect($results['successful_regions'])->toBe(1);
    expect($results['failed_regions'])->toBe(1);
    expect($results['errors'])->toHaveCount(1);
    expect($results['errors'][0]['error'])->toBe('News collection failed');
});

it('runs business discovery for all regions', function () {
    Region::factory()->count(2)->create();

    $this->businessDiscoveryMock->shouldReceive('discoverBusinesses')->with(Mockery::type(Region::class))->once()->andReturn(5);
    $this->businessDiscoveryMock->shouldReceive('discoverBusinesses')->with(Mockery::type(Region::class))->once()->andReturn(3);

    $results = $this->service->runBusinessDiscovery();

    expect($results['total_regions'])->toBe(2);
    expect($results['successful_regions'])->toBe(2);
    expect($results['failed_regions'])->toBe(0);
    expect($results['total_businesses_discovered'])->toBe(8); // 5 + 3
    expect($results['errors'])->toBeEmpty();
});

it('handles errors in business discovery', function () {
    Region::factory()->create(['name' => 'Working Region']);
    Region::factory()->create(['name' => 'Failing Region']);

    $this->businessDiscoveryMock->shouldReceive('discoverBusinesses')->with(Mockery::type(Region::class))->once()->andReturn(5);
    $this->businessDiscoveryMock->shouldReceive('discoverBusinesses')
        ->with(Mockery::type(Region::class))
        ->once()
        ->andThrow(new Exception('API error'));

    $results = $this->service->runBusinessDiscovery();

    expect($results['total_regions'])->toBe(2);
    expect($results['successful_regions'])->toBe(1);
    expect($results['failed_regions'])->toBe(1);
    expect($results['total_businesses_discovered'])->toBe(5);
    expect($results['errors'])->toHaveCount(1);
    expect($results['errors'][0]['error'])->toBe('API error');
});

it('returns workflow statistics', function () {
    $region = Region::factory()->create();

    $stats = $this->service->getWorkflowStats();

    expect($stats)->toHaveKeys([
        'regions_count',
        'pending_articles',
        'shortlisted_drafts',
        'ready_for_generation',
        'ready_for_publishing',
        'published_drafts',
        'rejected_drafts',
    ]);
    expect($stats['regions_count'])->toBe(1);
});

it('aggregates phase results across multiple regions', function () {
    Region::factory()->count(3)->create();

    // Mock service calls for any region (will be called 3 times)
    $this->newsCollectionMock->shouldReceive('collectNews')->with(Mockery::type(Region::class))->times(3)->andReturn(10);
    $this->contentCurationMock->shouldReceive('shortlistArticles')->with(Mockery::type(Region::class))->times(3)->andReturn(5);
    $this->factCheckingMock->shouldReceive('processForRegion')->with(Mockery::type(Region::class))->times(3)->andReturn(5);
    $this->contentCurationMock->shouldReceive('finalSelection')->with(Mockery::type(Region::class))->times(3)->andReturn(3);
    $this->articleGenerationMock->shouldReceive('generateArticles')->with(Mockery::type(Region::class))->times(3)->andReturn(3);
    $this->publishingMock->shouldReceive('publishArticles')->with(Mockery::type(Region::class))->times(3)->andReturn(2);

    $results = $this->service->runDailyWorkflow();

    expect($results['total_regions'])->toBe(3);
    expect($results['successful_regions'])->toBe(3);
    expect($results['phases']['news_collection'])->toBe(30); // 10 * 3
    expect($results['phases']['shortlisting'])->toBe(15); // 5 * 3
    expect($results['phases']['fact_checking'])->toBe(15); // 5 * 3
    expect($results['phases']['final_selection'])->toBe(9); // 3 * 3
    expect($results['phases']['article_generation'])->toBe(9); // 3 * 3
    expect($results['phases']['publishing'])->toBe(6); // 2 * 3
});

it('handles workflow with no regions', function () {
    $results = $this->service->runDailyWorkflow();

    expect($results['total_regions'])->toBe(0);
    expect($results['successful_regions'])->toBe(0);
    expect($results['failed_regions'])->toBe(0);
    expect($results['phases']['news_collection'])->toBe(0);
});

it('continues processing other regions when one fails', function () {
    Region::factory()->count(3)->create();

    // Mock successful workflow for 2 regions
    $this->newsCollectionMock->shouldReceive('collectNews')->with(Mockery::type(Region::class))->twice()->andReturn(10);
    $this->contentCurationMock->shouldReceive('shortlistArticles')->with(Mockery::type(Region::class))->twice()->andReturn(5);
    $this->factCheckingMock->shouldReceive('processForRegion')->with(Mockery::type(Region::class))->twice()->andReturn(5);
    $this->contentCurationMock->shouldReceive('finalSelection')->with(Mockery::type(Region::class))->twice()->andReturn(3);
    $this->articleGenerationMock->shouldReceive('generateArticles')->with(Mockery::type(Region::class))->twice()->andReturn(3);
    $this->publishingMock->shouldReceive('publishArticles')->with(Mockery::type(Region::class))->twice()->andReturn(2);

    // Mock failed workflow for 1 region
    $this->newsCollectionMock->shouldReceive('collectNews')
        ->with(Mockery::type(Region::class))
        ->once()
        ->andThrow(new Exception('Failed'));

    $results = $this->service->runDailyWorkflow();

    expect($results['total_regions'])->toBe(3);
    expect($results['successful_regions'])->toBe(2);
    expect($results['failed_regions'])->toBe(1);
    expect($results['phases']['news_collection'])->toBe(20); // Only from 2 successful regions
});
