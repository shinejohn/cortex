<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Contracts\GeocodingServiceInterface;
use App\Models\CollectionMethod;
use App\Models\Event;
use App\Models\Region;
use App\Models\Workspace;
use Carbon\Carbon;
use ICal\ICal;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

final class EventCollectionService
{
    public function __construct(
        private readonly EventDeduplicationService $deduplication,
        private readonly SchemaOrgEventParser $schemaParser,
        private readonly GeocodingServiceInterface $geocodingService
    ) {}

    /**
     * Parse iCal URL and return event data arrays.
     *
     * @return array<int, array<string, mixed>>
     */
    public function fetchFromIcal(string $icalUrl, string $regionId): array
    {
        $events = [];
        try {
            $ical = new ICal($icalUrl, [
                'filterDaysBefore' => 0,
                'filterDaysAfter' => 90,
                'httpUserAgent' => 'Mozilla/5.0 (compatible; DayNewsBot/1.0)',
            ]);

            if (! $ical->hasEvents()) {
                return [];
            }

            $icalEvents = $ical->eventsFromRange(now(), now()->addDays(90));

            foreach ($icalEvents as $ev) {
                $title = $ev->summary ?? '';
                if ($title === '') {
                    continue;
                }

                $dtStart = $ev->dtstart_tz ?? $ev->dtstart ?? null;
                $eventDate = $dtStart ? Carbon::parse($dtStart) : null;
                if (! $eventDate || $eventDate->isPast()) {
                    continue;
                }

                $events[] = [
                    'title' => $title,
                    'event_date' => $eventDate->format('Y-m-d H:i:s'),
                    'time' => $eventDate->format('g:i A'),
                    'venue_name' => null,
                    'venue_address' => $ev->location ?? null,
                    'description' => $ev->description ?? '',
                    'source_url' => $ev->url ?? $icalUrl,
                    'external_id' => $ev->uid ?? null,
                    'content_hash' => null,
                ];
            }
        } catch (Throwable $e) {
            Log::warning('EventCollectionService: iCal parse failed', [
                'url' => $icalUrl,
                'error' => $e->getMessage(),
            ]);
        }

        return $events;
    }

    /**
     * Extract schema.org Event from HTML.
     *
     * @return array<int, array<string, mixed>>
     */
    public function extractSchemaOrgEvents(string $html, string $pageUrl): array
    {
        $parsed = $this->schemaParser->parse($html);
        $events = [];

        foreach ($parsed as $p) {
            $eventData = $this->schemaParser->toEventData($p, $pageUrl);
            $eventData['content_hash'] = $this->deduplication->generateContentHash($eventData);
            $events[] = $eventData;
        }

        return $events;
    }

    /**
     * Process a CollectionMethod that has event content.
     *
     * @return array{created: int, skipped: int}
     */
    public function collectFromMethod(CollectionMethod $method): array
    {
        $source = $method->source;
        $region = $source->region;
        if (! $region) {
            return ['created' => 0, 'skipped' => 0];
        }

        $maxEvents = config('news-workflow.event_collection.max_events_per_source_per_run', 50);
        $created = 0;
        $skipped = 0;

        if ($method->method_type === CollectionMethod::TYPE_ICAL) {
            $eventDataList = $this->fetchFromIcal($method->endpoint_url, $region->id);
        } else {
            $response = Http::timeout(30)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; DayNewsBot/1.0)'])
                ->get($method->endpoint_url);

            if (! $response->successful()) {
                throw new RuntimeException("HTTP {$response->status()} for {$method->endpoint_url}");
            }

            $eventDataList = $this->extractSchemaOrgEvents($response->body(), $method->endpoint_url);
        }

        foreach (array_slice($eventDataList, 0, $maxEvents) as $eventData) {
            $eventData['content_hash'] = $eventData['content_hash'] ?? $this->deduplication->generateContentHash($eventData);
            $event = $this->createEvent($eventData, $region, 'direct_collection');
            if ($event) {
                $created++;
            } else {
                $skipped++;
            }
        }

        $method->recordCollection($created + $skipped, $skipped);

        return ['created' => $created, 'skipped' => $skipped];
    }

    /**
     * Create Event from validated event data (with deduplication).
     */
    public function createEvent(array $data, Region $region, ?string $sourceType = 'direct_collection'): ?Event
    {
        if (! config('news-workflow.event_collection.enabled', true)) {
            return null;
        }

        $duplicate = $this->deduplication->findDuplicate($data, $region->id);
        if ($duplicate) {
            Log::info('EventCollectionService: Duplicate skipped', [
                'existing_id' => $duplicate->id,
                'title' => $data['title'] ?? 'unknown',
            ]);

            return null;
        }

        $eventDate = isset($data['event_date'])
            ? Carbon::parse($data['event_date'])
            : now()->addWeek();

        $locationData = $this->resolveLocation($data, $region);
        $workspace = $this->getSystemWorkspace();

        $event = Event::create([
            'title' => $data['title'] ?? 'Untitled Event',
            'event_date' => $eventDate,
            'time' => $data['time'] ?? $eventDate->format('g:i A'),
            'description' => $data['description'] ?? '',
            'category' => $data['category'] ?? 'other',
            'subcategories' => $data['subcategories'] ?? [],
            'badges' => $data['badges'] ?? [],
            'is_free' => $data['is_free'] ?? true,
            'price_min' => $data['price_min'] ?? 0,
            'price_max' => $data['price_max'] ?? 0,
            'venue_id' => null,
            'workspace_id' => $workspace->id,
            'source_type' => $sourceType,
            'source_url' => $data['source_url'] ?? null,
            'external_id' => $data['external_id'] ?? null,
            'content_hash' => $data['content_hash'] ?? $this->deduplication->generateContentHash($data),
            'status' => 'published',
            'latitude' => $locationData['latitude'] ?? null,
            'longitude' => $locationData['longitude'] ?? null,
            'postal_code' => $locationData['postal_code'] ?? null,
            'google_place_id' => $locationData['google_place_id'] ?? null,
        ]);

        $event->regions()->attach($region->id);

        return $event;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{latitude?: float, longitude?: float, postal_code?: string, google_place_id?: string}
     */
    private function resolveLocation(array $data, Region $region): array
    {
        $venueName = $data['venue_name'] ?? null;
        $venueAddress = $data['venue_address'] ?? null;

        if ($venueName || $venueAddress) {
            $geo = $this->geocodingService->geocodeVenue(
                $venueName ?? '',
                $venueAddress,
                $region->name
            );
            if ($geo) {
                return $geo;
            }
        }

        return [];
    }

    private function getSystemWorkspace(): Workspace
    {
        $workspaceId = config('news-workflow.event_extraction.system_workspace_id');

        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if ($workspace) {
                return $workspace;
            }
        }

        $name = config('news-workflow.event_extraction.system_workspace_name', 'AI Event Extraction');

        return Workspace::firstOrCreate(
            ['name' => $name],
            ['slug' => Str::slug($name)]
        );
    }
}
