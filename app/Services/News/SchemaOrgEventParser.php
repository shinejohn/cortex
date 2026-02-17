<?php

declare(strict_types=1);

namespace App\Services\News;

use Carbon\Carbon;

/**
 * Extracts @type: Event from JSON-LD in HTML.
 */
final class SchemaOrgEventParser
{
    /**
     * Parse HTML for schema.org Event JSON-LD and return structured event data.
     *
     * @return array<int, array{title: string, startDate: ?string, endDate: ?string, location: ?array{name?: string, address?: string|array}, description?: string, url?: string, image?: string}>
     */
    public function parse(string $html): array
    {
        $events = [];

        // Find all JSON-LD script blocks
        if (preg_match_all('/<script[^>]+type=["\']application\/ld\+json["\'][^>]*>([\s\S]*?)<\/script>/i', $html, $matches)) {
            foreach ($matches[1] as $json) {
                $decoded = json_decode(mb_trim($json), true);
                if (! is_array($decoded)) {
                    continue;
                }
                $items = $decoded['@graph'] ?? [$decoded];
                foreach ($items as $item) {
                    if (! is_array($item)) {
                        continue;
                    }
                    $type = $item['@type'] ?? null;
                    if ($type === 'Event' || (is_array($type) && in_array('Event', $type, true))) {
                        $event = $this->normalizeEvent($item);
                        if ($event['title'] !== '') {
                            $events[] = $event;
                        }
                    }
                }
            }
        }

        return $events;
    }

    /**
     * Convert parsed schema.org event to Event model format.
     *
     * @param  array{title: string, startDate: ?string, endDate: ?string, location: ?array{name?: string, address?: string|array}, description?: string, url?: string, image?: string}  $parsed
     * @return array<string, mixed>
     */
    public function toEventData(array $parsed, string $pageUrl): array
    {
        $startDate = $parsed['startDate'] ? Carbon::parse($parsed['startDate']) : null;
        $loc = $parsed['location'] ?? [];
        $venueName = is_array($loc) ? ($loc['name'] ?? null) : null;
        $venueAddress = is_array($loc) ? $this->extractAddress($loc) : null;

        return [
            'title' => $parsed['title'],
            'event_date' => $startDate?->format('Y-m-d H:i:s'),
            'time' => $startDate?->format('g:i A'),
            'venue_name' => $venueName,
            'venue_address' => $venueAddress,
            'description' => $parsed['description'] ?? '',
            'source_url' => $parsed['url'] ?? $pageUrl,
            'image' => $parsed['image'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array{title: string, startDate: ?string, endDate: ?string, location: ?array{name?: string, address?: string|array}, description?: string, url?: string, image?: string}
     */
    private function normalizeEvent(array $item): array
    {
        $title = $this->extractString($item, 'name') ?: $this->extractString($item, 'title') ?: '';

        $startDate = $this->extractString($item, 'startDate');
        $endDate = $this->extractString($item, 'endDate');

        $location = null;
        $loc = $item['location'] ?? null;
        if (is_array($loc)) {
            $location = [
                'name' => $this->extractString($loc, 'name'),
                'address' => $this->extractAddress($loc),
            ];
        } elseif (is_string($loc)) {
            $location = ['address' => $loc];
        }

        $description = $this->extractString($item, 'description');
        $url = $this->extractString($item, 'url');
        $image = $this->extractString($item, 'image');
        if (is_array($image)) {
            $image = $image['url'] ?? $image[0] ?? null;
        }

        return [
            'title' => $title,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'location' => $location,
            'description' => $description ?: null,
            'url' => $url ?: null,
            'image' => is_string($image) ? $image : null,
        ];
    }

    private function extractString(array $arr, string $key): ?string
    {
        $v = $arr[$key] ?? null;
        if (is_string($v)) {
            return $v;
        }
        if (is_array($v) && isset($v['@value'])) {
            return (string) $v['@value'];
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $loc
     */
    private function extractAddress(array $loc): ?string
    {
        $addr = $loc['address'] ?? null;
        if (is_string($addr)) {
            return $addr;
        }
        if (is_array($addr)) {
            $parts = array_filter([
                $addr['streetAddress'] ?? null,
                $addr['addressLocality'] ?? null,
                $addr['addressRegion'] ?? null,
                $addr['postalCode'] ?? null,
            ]);

            return implode(', ', $parts) ?: null;
        }

        return null;
    }
}
