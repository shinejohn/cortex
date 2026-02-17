<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\Event;
use App\Models\Region;
use Carbon\Carbon;
use Throwable;

final class EventDeduplicationService
{
    /**
     * Generate content hash for an event (title + date + venue + url).
     *
     * @param  array<string, mixed>  $eventData
     */
    public function generateContentHash(array $eventData): string
    {
        $title = $this->normalizeTitle($eventData['title'] ?? '');
        $date = isset($eventData['event_date'])
            ? (is_string($eventData['event_date'])
                ? Carbon::parse($eventData['event_date'])->format('Y-m-d')
                : $eventData['event_date']->format('Y-m-d'))
            : '';
        $venue = $this->normalizeVenueName($eventData['venue_name'] ?? null);
        $url = mb_strtolower(mb_trim($eventData['source_url'] ?? $eventData['url'] ?? ''));

        return hash('sha256', $title.'|'.$date.'|'.$venue.'|'.$url);
    }

    /**
     * Check if event already exists. Returns existing Event or null.
     *
     * @param  array<string, mixed>  $eventData
     */
    public function findDuplicate(array $eventData, ?string $regionId = null): ?Event
    {
        // 1. source_url (canonical event URL)
        $sourceUrl = mb_trim($eventData['source_url'] ?? $eventData['url'] ?? '');
        if ($sourceUrl !== '') {
            $existing = Event::where('source_url', $sourceUrl)->first();
            if ($existing) {
                return $existing;
            }
        }

        // 2. external_id (Eventbrite ID, Meetup ID, etc.)
        $externalId = mb_trim($eventData['external_id'] ?? '');
        if ($externalId !== '') {
            $existing = Event::where('external_id', $externalId)->first();
            if ($existing) {
                return $existing;
            }
        }

        // 3. content_hash
        $contentHash = $eventData['content_hash'] ?? $this->generateContentHash($eventData);
        if ($contentHash !== '') {
            $existing = Event::where('content_hash', $contentHash)->first();
            if ($existing) {
                return $existing;
            }
        }

        // 4. Fuzzy: same region, same date, similar title, venue match
        return $this->findFuzzyDuplicate($eventData, $regionId);
    }

    /**
     * Normalize title for fuzzy matching.
     */
    public function normalizeTitle(string $title): string
    {
        $t = mb_strtolower(mb_trim($title));
        $t = preg_replace('/\s+/', ' ', $t);

        return $t ?: '';
    }

    /**
     * Normalize venue name for fuzzy matching.
     */
    public function normalizeVenueName(?string $name): string
    {
        if ($name === null || $name === '') {
            return '';
        }
        $n = mb_strtolower(mb_trim($name));
        $n = preg_replace('/\s+/', ' ', $n);

        return $n ?: '';
    }

    /**
     * Fuzzy duplicate detection: same date, similar title, optional venue.
     *
     * @param  array<string, mixed>  $eventData
     */
    private function findFuzzyDuplicate(array $eventData, ?string $regionId): ?Event
    {
        $title = $this->normalizeTitle($eventData['title'] ?? '');
        if ($title === '') {
            return null;
        }

        $eventDate = $this->parseEventDate($eventData['event_date'] ?? null);
        if (! $eventDate) {
            return null;
        }

        $dateTolerance = config('news-workflow.event_collection.deduplication.date_tolerance_days', 0);
        $titleThreshold = config('news-workflow.event_collection.deduplication.title_similarity_threshold', 85) / 100;
        $requireVenue = config('news-workflow.event_collection.deduplication.require_venue_match', false);

        $query = Event::query()
            ->whereDate('event_date', '>=', $eventDate->copy()->subDays($dateTolerance))
            ->whereDate('event_date', '<=', $eventDate->copy()->addDays($dateTolerance));

        if ($regionId) {
            $query->whereHas('regions', fn ($q) => $q->where('regions.id', $regionId));
        }

        $candidates = $query->get();

        $venueName = $this->normalizeVenueName($eventData['venue_name'] ?? null);

        foreach ($candidates as $candidate) {
            $candTitle = $this->normalizeTitle($candidate->title);
            $similarity = $this->stringSimilarity($title, $candTitle);
            if ($similarity < $titleThreshold) {
                continue;
            }

            if ($requireVenue && $venueName !== '') {
                $candVenue = $candidate->venue
                    ? $this->normalizeVenueName($candidate->venue->name)
                    : '';
                if ($candVenue === '' || $this->stringSimilarity($venueName, $candVenue) < 0.8) {
                    continue;
                }
            }

            return $candidate;
        }

        return null;
    }

    private function parseEventDate(mixed $date): ?Carbon
    {
        if ($date === null || $date === '') {
            return null;
        }
        try {
            return Carbon::parse($date);
        } catch (Throwable) {
            return null;
        }
    }

    private function stringSimilarity(string $a, string $b): float
    {
        if ($a === $b) {
            return 1.0;
        }
        if ($a === '' || $b === '') {
            return 0.0;
        }
        similar_text($a, $b, $percent);

        return $percent / 100;
    }
}
