<?php

declare(strict_types=1);

namespace App\Services\Civic;

use App\Models\CivicContentItem;
use App\Models\CivicSource;
use App\Models\Region;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Legistar Service
 * 
 * Handles integration with Granicus Legistar Web API.
 * Legistar is used by 70% of the largest US cities and counties.
 * 
 * API Documentation: https://webapi.legistar.com/Help
 */
class LegistarService
{
    private const API_BASE_URL = 'https://webapi.legistar.com/v1';
    private const MAX_RESULTS_PER_CALL = 100;
    private const REQUEST_TIMEOUT = 30;

    /**
     * Fetch upcoming events (meetings) from Legistar
     */
    public function fetchEvents(CivicSource $source, int $daysAhead = 30): Collection
    {
        $client = $source->api_client_name;
        
        if (empty($client)) {
            throw new Exception("Legistar client name not configured for source: {$source->name}");
        }

        $fromDate = now()->format('Y-m-d');
        $toDate = now()->addDays($daysAhead)->format('Y-m-d');

        Log::info('Legistar: Fetching events', [
            'client' => $client,
            'source_id' => $source->id,
            'from_date' => $fromDate,
            'to_date' => $toDate,
        ]);

        try {
            $url = self::API_BASE_URL . "/{$client}/events";
            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->get($url, [
                    '$filter' => "EventDate ge datetime'{$fromDate}' and EventDate le datetime'{$toDate}'",
                    '$orderby' => 'EventDate asc',
                    '$top' => self::MAX_RESULTS_PER_CALL,
                ]);

            if (!$response->successful()) {
                throw new Exception("Legistar API error: HTTP {$response->status()}");
            }

            $events = collect($response->json());

            Log::info('Legistar: Events fetched', [
                'client' => $client,
                'count' => $events->count(),
            ]);

            return $events->map(fn($event) => $this->transformEvent($event, $source));

        } catch (Exception $e) {
            Log::error('Legistar: Failed to fetch events', [
                'client' => $client,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Fetch recent matters (legislation) from Legistar
     */
    public function fetchMatters(CivicSource $source, int $daysBack = 14): Collection
    {
        $client = $source->api_client_name;
        
        if (empty($client)) {
            throw new Exception("Legistar client name not configured for source: {$source->name}");
        }

        $fromDate = now()->subDays($daysBack)->format('Y-m-d');

        Log::info('Legistar: Fetching matters', [
            'client' => $client,
            'source_id' => $source->id,
            'from_date' => $fromDate,
        ]);

        try {
            $url = self::API_BASE_URL . "/{$client}/matters";
            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->get($url, [
                    '$filter' => "MatterIntroDate ge datetime'{$fromDate}'",
                    '$orderby' => 'MatterIntroDate desc',
                    '$top' => self::MAX_RESULTS_PER_CALL,
                ]);

            if (!$response->successful()) {
                throw new Exception("Legistar API error: HTTP {$response->status()}");
            }

            $matters = collect($response->json());

            Log::info('Legistar: Matters fetched', [
                'client' => $client,
                'count' => $matters->count(),
            ]);

            return $matters->map(fn($matter) => $this->transformMatter($matter, $source));

        } catch (Exception $e) {
            Log::error('Legistar: Failed to fetch matters', [
                'client' => $client,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Fetch event items (agenda items) for a specific event
     */
    public function fetchEventItems(CivicSource $source, int $eventId): Collection
    {
        $client = $source->api_client_name;

        try {
            $url = self::API_BASE_URL . "/{$client}/events/{$eventId}/eventitems";
            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->get($url, [
                    '$top' => 200, // Agendas can have many items
                ]);

            if (!$response->successful()) {
                return collect();
            }

            return collect($response->json());

        } catch (Exception $e) {
            Log::warning('Legistar: Failed to fetch event items', [
                'client' => $client,
                'event_id' => $eventId,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

    /**
     * Fetch bodies (committees, boards) for a client
     */
    public function fetchBodies(CivicSource $source): Collection
    {
        $client = $source->api_client_name;

        try {
            $url = self::API_BASE_URL . "/{$client}/bodies";
            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->get($url, [
                    '$filter' => 'BodyActiveFlag eq 1',
                ]);

            if (!$response->successful()) {
                return collect();
            }

            return collect($response->json());

        } catch (Exception $e) {
            Log::warning('Legistar: Failed to fetch bodies', [
                'client' => $client,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

    /**
     * Test if a Legistar client exists and is accessible
     */
    public function testClient(string $clientName): bool
    {
        try {
            $url = self::API_BASE_URL . "/{$clientName}/bodies";
            $response = Http::timeout(10)->get($url, ['$top' => 1]);

            return $response->successful();

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Discover Legistar client name for a city
     * 
     * Tries common patterns: cityname, citynamest, city-name
     */
    public function discoverClient(string $cityName, ?string $state = null): ?string
    {
        $normalized = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $cityName));
        
        $candidates = [
            $normalized,
            $normalized . strtolower($state ?? ''),
            str_replace(' ', '', strtolower($cityName)),
            str_replace(' ', '-', strtolower($cityName)),
        ];

        // Add state abbreviation variations
        if ($state) {
            $stateAbbr = strtolower($state);
            $candidates[] = $normalized . $stateAbbr;
            $candidates[] = $stateAbbr . $normalized;
        }

        foreach (array_unique($candidates) as $candidate) {
            Log::debug('Legistar: Testing client name', ['candidate' => $candidate]);
            
            if ($this->testClient($candidate)) {
                Log::info('Legistar: Discovered client', [
                    'city' => $cityName,
                    'client' => $candidate,
                ]);
                return $candidate;
            }
        }

        return null;
    }

    /**
     * Collect all content from a Legistar source
     */
    public function collectFromSource(CivicSource $source): array
    {
        $items = [];
        $errors = [];

        // Fetch upcoming meetings/events
        try {
            $events = $this->fetchEvents($source);
            foreach ($events as $eventData) {
                $items[] = $eventData;
            }
        } catch (Exception $e) {
            $errors[] = "Events: {$e->getMessage()}";
        }

        // Fetch recent legislation/matters
        try {
            $matters = $this->fetchMatters($source);
            foreach ($matters as $matterData) {
                $items[] = $matterData;
            }
        } catch (Exception $e) {
            $errors[] = "Matters: {$e->getMessage()}";
        }

        if (!empty($errors)) {
            Log::warning('Legistar: Collection completed with errors', [
                'source_id' => $source->id,
                'errors' => $errors,
                'items_collected' => count($items),
            ]);
        }

        return $items;
    }

    /**
     * Transform Legistar event to CivicContentItem format
     */
    private function transformEvent(array $event, CivicSource $source): array
    {
        $eventDate = !empty($event['EventDate']) 
            ? Carbon::parse($event['EventDate']) 
            : null;

        $eventTime = !empty($event['EventTime'])
            ? $event['EventTime']
            : null;

        // Build title
        $bodyName = $event['EventBodyName'] ?? 'Meeting';
        $title = "{$bodyName} - " . ($eventDate ? $eventDate->format('F j, Y') : 'Date TBD');

        // Build description
        $description = [];
        if (!empty($event['EventBodyName'])) {
            $description[] = "Body: {$event['EventBodyName']}";
        }
        if ($eventDate) {
            $description[] = "Date: " . $eventDate->format('l, F j, Y');
        }
        if ($eventTime) {
            $description[] = "Time: {$eventTime}";
        }
        if (!empty($event['EventLocation'])) {
            $description[] = "Location: {$event['EventLocation']}";
        }
        if (!empty($event['EventAgendaStatusName'])) {
            $description[] = "Status: {$event['EventAgendaStatusName']}";
        }

        return [
            'content_type' => CivicContentItem::TYPE_MEETING,
            'external_id' => (string) ($event['EventId'] ?? ''),
            'title' => $title,
            'description' => implode("\n", $description),
            'url' => $this->buildEventUrl($source->api_client_name, $event['EventId'] ?? 0),
            'published_at' => now(),
            'event_date' => $eventDate,
            'category' => CivicContentItem::CATEGORY_GOVERNMENT,
            'subcategory' => 'meeting',
            'body_name' => $event['EventBodyName'] ?? null,
            'meeting_type' => $this->determineMeetingType($event),
            'raw_data' => $event,
            'content_hash' => CivicContentItem::generateHash(
                $title,
                null,
                (string) ($event['EventId'] ?? '')
            ),
        ];
    }

    /**
     * Transform Legistar matter to CivicContentItem format
     */
    private function transformMatter(array $matter, CivicSource $source): array
    {
        $introDate = !empty($matter['MatterIntroDate'])
            ? Carbon::parse($matter['MatterIntroDate'])
            : null;

        // Build title
        $matterFile = $matter['MatterFile'] ?? 'Item';
        $matterName = $matter['MatterName'] ?? $matter['MatterTitle'] ?? 'Legislative Matter';
        $title = "[{$matterFile}] {$matterName}";

        // Build description
        $description = [];
        if (!empty($matter['MatterTypeName'])) {
            $description[] = "Type: {$matter['MatterTypeName']}";
        }
        if (!empty($matter['MatterStatusName'])) {
            $description[] = "Status: {$matter['MatterStatusName']}";
        }
        if (!empty($matter['MatterBodyName'])) {
            $description[] = "Body: {$matter['MatterBodyName']}";
        }
        if ($introDate) {
            $description[] = "Introduced: " . $introDate->format('F j, Y');
        }
        if (!empty($matter['MatterText'])) {
            $description[] = "\n" . \Illuminate\Support\Str::limit($matter['MatterText'], 500);
        }

        return [
            'content_type' => CivicContentItem::TYPE_MATTER,
            'external_id' => (string) ($matter['MatterId'] ?? ''),
            'title' => \Illuminate\Support\Str::limit($title, 500),
            'description' => implode("\n", $description),
            'full_content' => $matter['MatterText'] ?? null,
            'url' => $this->buildMatterUrl($source->api_client_name, $matter['MatterId'] ?? 0),
            'published_at' => $introDate,
            'category' => CivicContentItem::CATEGORY_GOVERNMENT,
            'subcategory' => strtolower($matter['MatterTypeName'] ?? 'legislation'),
            'body_name' => $matter['MatterBodyName'] ?? null,
            'tags' => array_filter([
                $matter['MatterTypeName'] ?? null,
                $matter['MatterStatusName'] ?? null,
            ]),
            'raw_data' => $matter,
            'content_hash' => CivicContentItem::generateHash(
                $title,
                null,
                (string) ($matter['MatterId'] ?? '')
            ),
        ];
    }

    /**
     * Build public URL for an event
     */
    private function buildEventUrl(string $client, int $eventId): string
    {
        return "https://{$client}.legistar.com/MeetingDetail.aspx?ID={$eventId}";
    }

    /**
     * Build public URL for a matter
     */
    private function buildMatterUrl(string $client, int $matterId): string
    {
        return "https://{$client}.legistar.com/LegislationDetail.aspx?ID={$matterId}";
    }

    /**
     * Determine meeting type from event data
     */
    private function determineMeetingType(array $event): string
    {
        $bodyName = strtolower($event['EventBodyName'] ?? '');
        
        if (str_contains($bodyName, 'special')) {
            return 'special';
        }
        if (str_contains($bodyName, 'emergency')) {
            return 'emergency';
        }
        if (str_contains($bodyName, 'workshop') || str_contains($bodyName, 'work session')) {
            return 'workshop';
        }
        if (str_contains($bodyName, 'hearing')) {
            return 'hearing';
        }

        return 'regular';
    }

    /**
     * Get known Legistar clients (partial list of major cities)
     */
    public static function getKnownClients(): array
    {
        return [
            'nyc' => 'New York City',
            'seattle' => 'Seattle',
            'chicago' => 'Chicago',
            'losangeles' => 'Los Angeles',
            'sanfrancisco' => 'San Francisco',
            'boston' => 'Boston',
            'philadelphia' => 'Philadelphia',
            'denver' => 'Denver',
            'austin' => 'Austin',
            'portland' => 'Portland',
            'oakland' => 'Oakland',
            'sandiego' => 'San Diego',
            'houston' => 'Houston',
            'phoenix' => 'Phoenix',
            'miami' => 'Miami',
            'atlanta' => 'Atlanta',
            'detroit' => 'Detroit',
            'minneapolis' => 'Minneapolis',
            'tampa' => 'Tampa',
            'orlando' => 'Orlando',
        ];
    }
}
