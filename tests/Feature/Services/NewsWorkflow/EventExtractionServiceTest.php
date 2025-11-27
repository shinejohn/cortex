<?php

declare(strict_types=1);

use App\Contracts\GeocodingServiceInterface;
use App\Models\Event;
use App\Models\EventExtractionDraft;
use App\Models\NewsArticle;
use App\Models\Performer;
use App\Models\Region;
use App\Models\Venue;
use App\Models\Workspace;
use App\Services\News\EventExtractionService;
use App\Services\News\EventPublishingService;
use App\Services\News\PerformerMatchingService;
use App\Services\News\PrismAiService;
use App\Services\News\VenueMatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create system workspace
    $this->systemWorkspace = Workspace::factory()->create([
        'name' => 'AI Event Extraction',
        'slug' => 'ai-event-extraction',
    ]);

    // Set config
    config(['news-workflow.event_extraction.enabled' => true]);
    config(['news-workflow.event_extraction.system_workspace_id' => $this->systemWorkspace->id]);
    config(['news-workflow.event_extraction.min_detection_confidence' => 60]);
    config(['news-workflow.event_extraction.min_extraction_confidence' => 70]);
    config(['news-workflow.event_extraction.auto_publish_threshold' => 85]);
});

describe('EventExtractionDraft Model', function () {
    it('creates draft with correct attributes', function () {
        $article = NewsArticle::factory()->create();
        $region = Region::factory()->create();

        $draft = EventExtractionDraft::create([
            'news_article_id' => $article->id,
            'region_id' => $region->id,
            'status' => 'detected',
            'detection_confidence' => 85.5,
        ]);

        expect($draft->status)->toBe('detected')
            ->and($draft->detection_confidence)->toBe('85.50')
            ->and($draft->newsArticle->id)->toBe($article->id)
            ->and($draft->region->id)->toBe($region->id);
    });

    it('has correct status scopes', function () {
        $region = Region::factory()->create();
        $article = NewsArticle::factory()->create(['region_id' => $region->id]);

        EventExtractionDraft::factory()->forArticle($article)->forRegion($region)->detected()->create();
        EventExtractionDraft::factory()->forRegion($region)->extracted()->create();
        EventExtractionDraft::factory()->forRegion($region)->validated()->create();
        EventExtractionDraft::factory()->forRegion($region)->rejected()->create();

        expect(EventExtractionDraft::detected()->count())->toBe(1)
            ->and(EventExtractionDraft::extracted()->count())->toBe(1)
            ->and(EventExtractionDraft::validated()->count())->toBe(1)
            ->and(EventExtractionDraft::rejected()->count())->toBe(1);
    });

    it('calculates shouldAutoPublish correctly', function () {
        $highQuality = EventExtractionDraft::factory()->create(['quality_score' => 90]);
        $lowQuality = EventExtractionDraft::factory()->create(['quality_score' => 70]);

        expect($highQuality->shouldAutoPublish())->toBeTrue()
            ->and($lowQuality->shouldAutoPublish())->toBeFalse();
    });
});

describe('Event Model Relationships', function () {
    it('has regions many-to-many relationship', function () {
        $event = Event::factory()->create();
        $region1 = Region::factory()->create();
        $region2 = Region::factory()->create();

        $event->regions()->attach([$region1->id, $region2->id]);

        expect($event->regions)->toHaveCount(2)
            ->and($event->regions->pluck('id')->toArray())->toContain($region1->id, $region2->id);
    });

    it('has sourceNewsArticle relationship', function () {
        $article = NewsArticle::factory()->create();
        $event = Event::factory()->create([
            'source_news_article_id' => $article->id,
            'source_type' => 'ai_extracted',
        ]);

        expect($event->sourceNewsArticle->id)->toBe($article->id)
            ->and($event->source_type)->toBe('ai_extracted');
    });

    it('filters by source type scopes', function () {
        Event::factory()->create(['source_type' => 'manual']);
        Event::factory()->create(['source_type' => 'ai_extracted']);
        Event::factory()->create(['source_type' => 'ai_extracted']);

        expect(Event::manual()->count())->toBe(1)
            ->and(Event::aiExtracted()->count())->toBe(2);
    });
});

describe('Region Model Events Relationship', function () {
    it('has events many-to-many relationship', function () {
        $region = Region::factory()->create();
        $event1 = Event::factory()->create();
        $event2 = Event::factory()->create();

        $region->events()->attach([$event1->id, $event2->id]);

        expect($region->events)->toHaveCount(2);
    });
});

describe('VenueMatchingService', function () {
    it('returns null for empty venue name', function () {
        $geocoding = mock(GeocodingServiceInterface::class);
        $service = new VenueMatchingService($geocoding);

        $result = $service->matchOrCreate(null);

        expect($result)->toBeNull();
    });

    it('finds exact match venue', function () {
        $geocoding = mock(GeocodingServiceInterface::class);
        $service = new VenueMatchingService($geocoding);

        $existingVenue = Venue::factory()->create([
            'name' => 'The Grand Theater',
            'workspace_id' => $this->systemWorkspace->id,
        ]);

        $result = $service->matchOrCreate('The Grand Theater');

        expect($result->id)->toBe($existingVenue->id);
    });

    it('finds case-insensitive match', function () {
        $geocoding = mock(GeocodingServiceInterface::class);
        $service = new VenueMatchingService($geocoding);

        $existingVenue = Venue::factory()->create([
            'name' => 'The Grand Theater',
            'workspace_id' => $this->systemWorkspace->id,
        ]);

        $result = $service->matchOrCreate('the grand theater');

        expect($result->id)->toBe($existingVenue->id);
    });

    it('creates new venue when no match found', function () {
        $geocoding = mock(GeocodingServiceInterface::class);
        $geocoding->shouldReceive('geocodeVenue')
            ->once()
            ->andReturn([
                'latitude' => 40.7128,
                'longitude' => -74.0060,
                'postal_code' => '10001',
                'google_place_id' => 'ChIJN1t_tDeuEmsRUsoyG83frY4',
                'formatted_address' => '123 Main St, New York, NY 10001',
            ]);

        $service = new VenueMatchingService($geocoding);

        $result = $service->matchOrCreate('New Unique Venue', '123 Main St');

        expect($result)->toBeInstanceOf(Venue::class)
            ->and($result->name)->toBe('New Unique Venue')
            ->and($result->latitude)->not->toBeNull()
            ->and($result->workspace_id)->toBe($this->systemWorkspace->id);
    });
});

describe('PerformerMatchingService', function () {
    it('returns null for empty performer name', function () {
        $service = new PerformerMatchingService;

        $result = $service->matchOrCreate(null);

        expect($result)->toBeNull();
    });

    it('finds exact match performer', function () {
        $service = new PerformerMatchingService;

        $existingPerformer = Performer::factory()->create([
            'name' => 'The Beatles',
            'workspace_id' => $this->systemWorkspace->id,
        ]);

        $result = $service->matchOrCreate('The Beatles');

        expect($result->id)->toBe($existingPerformer->id);
    });

    it('creates new performer when no match found', function () {
        $service = new PerformerMatchingService;

        $result = $service->matchOrCreate('New Band Name');

        expect($result)->toBeInstanceOf(Performer::class)
            ->and($result->name)->toBe('New Band Name')
            ->and($result->workspace_id)->toBe($this->systemWorkspace->id);
    });
});

describe('EventPublishingService', function () {
    it('publishes validated draft as published event when quality score high', function () {
        $geocoding = mock(GeocodingServiceInterface::class);
        $geocoding->shouldReceive('geocodeVenue')->andReturn(null);

        $service = new EventPublishingService($geocoding);

        $region = Region::factory()->create();
        $article = NewsArticle::factory()->create(['region_id' => $region->id]);
        $venue = Venue::factory()->create(['workspace_id' => $this->systemWorkspace->id]);

        $draft = EventExtractionDraft::factory()
            ->forArticle($article)
            ->forRegion($region)
            ->validated()
            ->create([
                'quality_score' => 90, // Above threshold
                'matched_venue_id' => $venue->id,
                'extracted_data' => [
                    'title' => 'Test Event',
                    'event_date' => now()->addWeek()->toIso8601String(),
                    'time' => '7:00 PM',
                    'description' => 'Test description',
                    'category' => 'music',
                    'is_free' => false,
                    'price_min' => 25,
                    'price_max' => 50,
                ],
            ]);

        $event = $service->publishDraft($draft);

        expect($event->status)->toBe('published')
            ->and($event->title)->toBe('Test Event')
            ->and($event->source_type)->toBe('ai_extracted')
            ->and($event->source_news_article_id)->toBe($article->id)
            ->and($event->venue_id)->toBe($venue->id)
            ->and($event->regions)->toHaveCount(1);

        $draft->refresh();
        expect($draft->status)->toBe('published')
            ->and($draft->published_event_id)->toBe($event->id);
    });

    it('publishes validated draft as draft event when quality score low', function () {
        $geocoding = mock(GeocodingServiceInterface::class);
        $geocoding->shouldReceive('geocodeVenue')->andReturn(null);

        $service = new EventPublishingService($geocoding);

        $region = Region::factory()->create();
        $article = NewsArticle::factory()->create(['region_id' => $region->id]);

        $draft = EventExtractionDraft::factory()
            ->forArticle($article)
            ->forRegion($region)
            ->validated()
            ->create([
                'quality_score' => 70, // Below threshold
                'extracted_data' => [
                    'title' => 'Low Quality Event',
                    'event_date' => now()->addWeek()->toIso8601String(),
                    'description' => 'Test',
                    'category' => 'other',
                    'is_free' => true,
                ],
            ]);

        $event = $service->publishDraft($draft);

        expect($event->status)->toBe('draft');
    });
});

describe('EventExtractionService Integration', function () {
    it('extracts events when AI detects event in article', function () {
        // Mock PrismAiService
        $prismAi = mock(PrismAiService::class);
        $prismAi->shouldReceive('detectEventInArticle')
            ->once()
            ->andReturn([
                'contains_event' => true,
                'confidence_score' => 85,
                'event_date_mentioned' => true,
                'rationale' => 'Article contains upcoming concert information',
            ]);

        $prismAi->shouldReceive('extractEventDetails')
            ->once()
            ->andReturn([
                'title' => 'Summer Concert',
                'event_date' => now()->addWeek()->toIso8601String(),
                'time' => '8:00 PM',
                'venue_name' => 'City Park Amphitheater',
                'venue_address' => '123 Park Lane',
                'description' => 'Annual summer concert series kicks off',
                'category' => 'music',
                'subcategories' => ['outdoor', 'live-music'],
                'is_free' => true,
                'price_min' => 0,
                'price_max' => 0,
                'performer_name' => 'Local Band',
                'badges' => ['family-friendly', 'outdoor'],
                'extraction_confidence' => 88,
            ]);

        // Mock GeocodingServiceInterface
        $geocoding = mock(GeocodingServiceInterface::class);
        $geocoding->shouldReceive('geocodeVenue')
            ->andReturn([
                'latitude' => 40.7128,
                'longitude' => -74.0060,
                'postal_code' => '10001',
                'google_place_id' => 'test123',
            ]);

        $venueMatching = new VenueMatchingService($geocoding);
        $performerMatching = new PerformerMatchingService;
        $eventPublishing = new EventPublishingService($geocoding);

        $service = new EventExtractionService(
            $prismAi,
            $venueMatching,
            $performerMatching,
            $eventPublishing
        );

        $region = Region::factory()->create(['is_active' => true]);
        $article = NewsArticle::factory()->create(['region_id' => $region->id]);

        $stats = $service->extractEventsForRegion($region);

        expect($stats['detected'])->toBe(1)
            ->and($stats['extracted'])->toBe(1)
            ->and($stats['validated'])->toBe(1)
            ->and($stats['published'])->toBe(1);

        // Verify event was created
        $event = Event::where('source_news_article_id', $article->id)->first();
        expect($event)->not->toBeNull()
            ->and($event->title)->toBe('Summer Concert')
            ->and($event->source_type)->toBe('ai_extracted');
    });

    it('skips articles without events', function () {
        $prismAi = mock(PrismAiService::class);
        $prismAi->shouldReceive('detectEventInArticle')
            ->once()
            ->andReturn([
                'contains_event' => false,
                'confidence_score' => 20,
                'rationale' => 'General news article without event information',
            ]);

        $geocoding = mock(GeocodingServiceInterface::class);
        $venueMatching = new VenueMatchingService($geocoding);
        $performerMatching = new PerformerMatchingService;
        $eventPublishing = new EventPublishingService($geocoding);

        $service = new EventExtractionService(
            $prismAi,
            $venueMatching,
            $performerMatching,
            $eventPublishing
        );

        $region = Region::factory()->create(['is_active' => true]);
        NewsArticle::factory()->create(['region_id' => $region->id]);

        $stats = $service->extractEventsForRegion($region);

        expect($stats['detected'])->toBe(0)
            ->and(EventExtractionDraft::count())->toBe(0);
    });

    it('skips articles with low confidence detection', function () {
        $prismAi = mock(PrismAiService::class);
        $prismAi->shouldReceive('detectEventInArticle')
            ->once()
            ->andReturn([
                'contains_event' => true,
                'confidence_score' => 40, // Below threshold
                'rationale' => 'Possibly contains event but unclear',
            ]);

        $geocoding = mock(GeocodingServiceInterface::class);
        $venueMatching = new VenueMatchingService($geocoding);
        $performerMatching = new PerformerMatchingService;
        $eventPublishing = new EventPublishingService($geocoding);

        $service = new EventExtractionService(
            $prismAi,
            $venueMatching,
            $performerMatching,
            $eventPublishing
        );

        $region = Region::factory()->create(['is_active' => true]);
        NewsArticle::factory()->create(['region_id' => $region->id]);

        $stats = $service->extractEventsForRegion($region);

        expect($stats['detected'])->toBe(0);
    });

    it('returns empty stats when extraction is disabled', function () {
        config(['news-workflow.event_extraction.enabled' => false]);

        $prismAi = mock(PrismAiService::class);
        $geocoding = mock(GeocodingServiceInterface::class);
        $venueMatching = new VenueMatchingService($geocoding);
        $performerMatching = new PerformerMatchingService;
        $eventPublishing = new EventPublishingService($geocoding);

        $service = new EventExtractionService(
            $prismAi,
            $venueMatching,
            $performerMatching,
            $eventPublishing
        );

        $region = Region::factory()->create();

        $stats = $service->extractEventsForRegion($region);

        expect($stats)->toBe([
            'detected' => 0,
            'extracted' => 0,
            'validated' => 0,
            'published' => 0,
            'rejected' => 0,
        ]);
    });
});
