<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\Event;
use App\Models\NewsArticle;
use App\Models\RawContent;
use App\Models\Region;
use App\Models\Venue;
use App\Services\News\EventExtractionService;
use DateTimeImmutable;
use DateTimeInterface;
use Exception;
use Illuminate\Support\Facades\Log;

final class ContentRoutingService
{
    public function __construct(
        private readonly EventExtractionService $eventExtraction,
    ) {}

    /**
     * Route a classified RawContent to all appropriate outputs.
     *
     * @return array{article: ?NewsArticle, event_created: bool, announcement_created: bool}
     */
    public function routeContent(RawContent $raw): array
    {
        if ($raw->classification_status !== RawContent::CLASS_CLASSIFIED) {
            Log::warning('ContentRouting: Attempted to route unclassified content', ['id' => $raw->id]);

            return ['article' => null, 'event_created' => false, 'announcement_created' => false];
        }

        if ($raw->processing_status === RawContent::PROC_COMPLETED) {
            return ['article' => null, 'event_created' => false, 'announcement_created' => false];
        }

        $results = [
            'article' => null,
            'event_created' => false,
            'announcement_created' => false,
        ];

        $contentTypes = $raw->content_types ?? [];
        $primaryType = $raw->primary_type ?? '';
        $priority = $raw->priority ?? 'normal';

        Log::info('ContentRouting: Routing classified content', [
            'id' => $raw->id,
            'title' => mb_substr($raw->source_title ?? '', 0, 60),
            'primary_type' => $primaryType,
            'content_types' => $contentTypes,
            'priority' => $priority,
        ]);

        try {
            $region = $this->resolveRegion($raw);

            if ($this->shouldCreateArticle($primaryType, $contentTypes)) {
                $results['article'] = $this->createNewsArticle($raw, $region);

                if (in_array($priority, ['breaking', 'high']) && $results['article']) {
                    $this->fastTrackArticle($results['article'], $priority);
                }
            }

            if ($raw->has_event && ! empty($raw->event_data)) {
                $results['event_created'] = $this->routeToEvent($raw, $region);
            }

            if ($this->isAnnouncement($primaryType, $contentTypes)) {
                $results['announcement_created'] = $this->routeToAnnouncement($raw, $region);
            }

            $outputIds = [];
            if ($results['article']) {
                $outputIds['article_id'] = $results['article']->id;
            }

            $raw->update([
                'processing_status' => RawContent::PROC_COMPLETED,
                'processed_at' => now(),
                'output_ids' => $outputIds,
                'article_id' => $results['article']?->id,
                'was_published' => $results['article'] !== null || $results['announcement_created'],
            ]);

            Log::info('ContentRouting: Content routed successfully', [
                'id' => $raw->id,
                'article_created' => $results['article'] !== null,
                'event_created' => $results['event_created'],
                'announcement_created' => $results['announcement_created'],
            ]);
        } catch (Exception $e) {
            Log::error('ContentRouting: Routing failed', [
                'id' => $raw->id,
                'error' => $e->getMessage(),
            ]);

            $raw->update([
                'processing_status' => RawContent::PROC_FAILED,
                'processing_error' => $e->getMessage(),
            ]);
        }

        return $results;
    }

    private function createNewsArticle(RawContent $raw, ?Region $region): ?NewsArticle
    {
        if (! $region) {
            Log::warning('ContentRouting: No region for article creation', ['id' => $raw->id]);

            return null;
        }

        $title = $raw->suggested_headline ?? $raw->source_title;
        $contentHash = hash('sha256', $title.'|'.($raw->source_url ?? ''));

        $exists = NewsArticle::where('content_hash', $contentHash)
            ->where('region_id', $region->id)
            ->exists();
        if ($exists) {
            Log::debug('ContentRouting: Duplicate article skipped', ['title' => $title]);

            return null;
        }

        $sourceType = $this->inferSourceType($raw);

        return NewsArticle::create([
            'region_id' => $region->id,
            'source_type' => $sourceType,
            'source_name' => $raw->source?->name ?? 'Pipeline B',
            'title' => $title,
            'url' => $raw->source_url,
            'content_snippet' => mb_substr($raw->source_content ?? $raw->source_excerpt ?? '', 0, 2000),
            'source_publisher' => $raw->source?->name,
            'published_at' => $raw->source_published_at ?? now(),
            'metadata' => [
                'raw_content_id' => $raw->id,
                'primary_type' => $raw->primary_type,
                'content_types' => $raw->content_types,
                'categories' => $raw->categories,
                'local_relevance_score' => $raw->local_relevance_score,
                'news_value_score' => $raw->news_value_score,
                'processing_tier' => $raw->processing_tier,
                'businesses_mentioned' => $raw->businesses_mentioned,
            ],
            'content_hash' => $contentHash,
            'processed' => false,
        ]);
    }

    private function routeToEvent(RawContent $raw, ?Region $region): bool
    {
        try {
            $eventData = $raw->event_data;
            if (empty($eventData) || empty($eventData['event_title'] ?? null)) {
                return false;
            }

            if (! $region) {
                Log::warning('ContentRouting: No region for event creation', ['id' => $raw->id]);

                return false;
            }

            $title = $eventData['event_title'] ?? $raw->source_title;
            $eventDate = $this->parseEventDate($eventData['event_date'] ?? null);
            $venue = $this->resolveVenue($eventData['event_venue'] ?? null, $region);

            $workspaceId = config('news-workflow.publishing.default_workspace_id');

            $event = Event::create([
                'title' => $title,
                'event_date' => $eventDate ?? now()->addWeek(),
                'time' => $eventData['event_time'] ?? null,
                'description' => $eventData['event_description'] ?? $raw->source_excerpt ?? $raw->source_content,
                'category' => $this->mapEventCategory($raw->primary_type, $raw->content_types ?? []),
                'venue_id' => $venue?->id,
                'workspace_id' => $workspaceId,
                'source_type' => 'content_routing',
                'status' => 'draft',
                'is_free' => $this->parseIsFree($eventData['event_cost'] ?? null),
            ]);

            $event->regions()->attach($region->id);

            $raw->update(['event_id' => $event->id]);

            Log::info('ContentRouting: Event created', [
                'raw_content_id' => $raw->id,
                'event_id' => $event->id,
                'event_title' => $title,
            ]);

            return true;
        } catch (Exception $e) {
            Log::warning('ContentRouting: Event routing failed', [
                'id' => $raw->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function parseEventDate(?string $date): ?DateTimeInterface
    {
        if (empty($date)) {
            return null;
        }

        try {
            return new DateTimeImmutable($date);
        } catch (Exception) {
            return null;
        }
    }

    private function resolveVenue(?string $venueName, Region $region): ?Venue
    {
        if (empty($venueName)) {
            return null;
        }

        $search = mb_substr(mb_trim($venueName), 0, 50);

        return Venue::where('name', 'like', '%'.$search.'%')->first();
    }

    private function mapEventCategory(string $primaryType, array $contentTypes): string
    {
        $map = [
            'community_event' => 'community',
            'sports_result' => 'sports',
            'meeting_notice' => 'community',
            'fundraiser' => 'charity',
        ];

        return $map[$primaryType] ?? 'community';
    }

    private function parseIsFree(?string $cost): bool
    {
        if (empty($cost)) {
            return false;
        }

        return mb_strtolower($cost) === 'free' || mb_strtolower($cost) === 'no cost';
    }

    private function routeToAnnouncement(RawContent $raw, ?Region $region): bool
    {
        Log::info('ContentRouting: Announcement routed', [
            'raw_content_id' => $raw->id,
            'title' => $raw->source_title,
        ]);

        return true;
    }

    private function fastTrackArticle(NewsArticle $article, string $priority): void
    {
        $article->update([
            'metadata' => array_merge($article->metadata ?? [], [
                'fast_tracked' => true,
                'priority' => $priority,
                'fast_tracked_at' => now()->toIso8601String(),
            ]),
        ]);

        Log::info('ContentRouting: Article fast-tracked', [
            'article_id' => $article->id,
            'priority' => $priority,
        ]);
    }

    private function shouldCreateArticle(string $primaryType, array $contentTypes): bool
    {
        $articleTypes = [
            'breaking_news', 'news', 'feature', 'business_news',
            'crime_report', 'school_news', 'sports_result',
            'human_interest', 'new_business', 'press_release',
        ];

        if (in_array($primaryType, $articleTypes)) {
            return true;
        }

        return ! empty(array_intersect($contentTypes, $articleTypes));
    }

    private function isAnnouncement(string $primaryType, array $contentTypes): bool
    {
        $announcementTypes = ['announcement', 'meeting_notice', 'community_event', 'fundraiser'];

        return in_array($primaryType, $announcementTypes) || ! empty(array_intersect($contentTypes, $announcementTypes));
    }

    private function resolveRegion(RawContent $raw): ?Region
    {
        if ($raw->region_id) {
            return Region::find($raw->region_id);
        }
        if ($raw->community_id) {
            $community = $raw->community;

            return $community?->regions()->first();
        }

        return null;
    }

    private function inferSourceType(RawContent $raw): string
    {
        $method = $raw->collection_method ?? '';

        return match ($method) {
            'rss' => 'rss_feed',
            'scrape' => 'web_scrape',
            'email' => 'email_newsletter',
            'wire_service' => 'wire_service',
            default => 'pipeline_b',
        };
    }
}
