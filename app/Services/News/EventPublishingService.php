<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Contracts\GeocodingServiceInterface;
use App\Models\Event;
use App\Models\EventExtractionDraft;
use App\Models\Region;
use App\Models\Workspace;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class EventPublishingService
{
    public function __construct(
        private readonly GeocodingServiceInterface $geocodingService
    ) {}

    /**
     * Publish validated events for a region
     */
    public function publishForRegion(Region $region): int
    {
        $drafts = EventExtractionDraft::where('region_id', $region->id)
            ->where('status', 'validated')
            ->get();

        $publishedCount = 0;

        foreach ($drafts as $draft) {
            try {
                $event = $this->publishDraft($draft);
                $publishedCount++;

                Log::info('EventPublishingService: Published extracted event', [
                    'draft_id' => $draft->id,
                    'event_id' => $event->id,
                    'event_title' => $event->title,
                    'status' => $event->status,
                ]);
            } catch (Exception $e) {
                Log::error('EventPublishingService: Failed to publish extracted event', [
                    'draft_id' => $draft->id,
                    'error' => $e->getMessage(),
                ]);

                $draft->update([
                    'status' => 'rejected',
                    'rejection_reason' => 'Publishing failed: '.$e->getMessage(),
                ]);
            }
        }

        return $publishedCount;
    }

    /**
     * Publish a single draft as an Event
     */
    public function publishDraft(EventExtractionDraft $draft): Event
    {
        return DB::transaction(function () use ($draft) {
            $data = $draft->extracted_data;
            $systemWorkspace = $this->getSystemWorkspace();

            // Determine status based on quality score
            $status = $draft->shouldAutoPublish() ? 'published' : 'draft';

            // Parse event date
            $eventDate = $this->parseEventDate($data['event_date'] ?? null);

            // Get location data from venue or geocode
            $locationData = $this->getLocationData($draft, $data);

            // Map category
            $category = $this->mapCategory($data['category'] ?? 'other');

            // Create event
            $event = Event::create([
                'title' => $data['title'],
                'event_date' => $eventDate,
                'time' => $data['time'] ?? $eventDate->format('g:i A'),
                'description' => $data['description'] ?? '',
                'category' => $category,
                'subcategories' => $data['subcategories'] ?? [],
                'badges' => $data['badges'] ?? [],
                'is_free' => $data['is_free'] ?? false,
                'price_min' => $data['price_min'] ?? 0,
                'price_max' => $data['price_max'] ?? 0,
                'venue_id' => $draft->matched_venue_id,
                'performer_id' => $draft->matched_performer_id,
                'workspace_id' => $systemWorkspace->id,
                'source_news_article_id' => $draft->news_article_id,
                'source_type' => 'ai_extracted',
                'status' => $status,
                'latitude' => $locationData['latitude'] ?? null,
                'longitude' => $locationData['longitude'] ?? null,
                'postal_code' => $locationData['postal_code'] ?? null,
                'google_place_id' => $locationData['google_place_id'] ?? null,
            ]);

            // Attach region (many-to-many)
            $event->regions()->attach($draft->region_id);

            // Update draft
            $draft->update([
                'status' => 'published',
                'published_event_id' => $event->id,
            ]);

            return $event;
        });
    }

    /**
     * Parse event date from various formats
     */
    private function parseEventDate(?string $dateString): Carbon
    {
        if (empty($dateString)) {
            return now()->addWeek();
        }

        try {
            return Carbon::parse($dateString);
        } catch (Exception $e) {
            Log::warning('EventPublishingService: Failed to parse event date', [
                'date_string' => $dateString,
                'error' => $e->getMessage(),
            ]);

            return now()->addWeek();
        }
    }

    /**
     * Get location data from venue or geocode
     */
    private function getLocationData(EventExtractionDraft $draft, array $data): array
    {
        // First try to get from matched venue
        if ($draft->matched_venue_id) {
            $venue = $draft->matchedVenue;
            if ($venue && $venue->latitude && $venue->longitude) {
                return [
                    'latitude' => $venue->latitude,
                    'longitude' => $venue->longitude,
                    'postal_code' => $venue->postal_code,
                    'google_place_id' => $venue->google_place_id,
                ];
            }
        }

        // Try to geocode from venue address
        if (! empty($data['venue_name']) || ! empty($data['venue_address'])) {
            $region = $draft->region;
            $geoData = $this->geocodingService->geocodeVenue(
                $data['venue_name'] ?? '',
                $data['venue_address'] ?? null,
                $region?->name
            );

            if ($geoData) {
                return $geoData;
            }
        }

        return [];
    }

    /**
     * Map extracted category to Event model category
     */
    private function mapCategory(string $category): string
    {
        $mapping = config('news-workflow.event_extraction.category_mapping', []);

        return $mapping[Str::lower($category)] ?? $category;
    }

    /**
     * Get system workspace
     */
    private function getSystemWorkspace(): Workspace
    {
        $workspaceId = config('news-workflow.event_extraction.system_workspace_id');

        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if ($workspace) {
                return $workspace;
            }
        }

        $workspaceName = config('news-workflow.event_extraction.system_workspace_name', 'AI Event Extraction');

        return Workspace::firstOrCreate(
            ['name' => $workspaceName],
            ['slug' => Str::slug($workspaceName)]
        );
    }
}
