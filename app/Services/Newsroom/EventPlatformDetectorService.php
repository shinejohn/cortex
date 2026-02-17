<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

/**
 * Detects event calendar systems embedded within websites.
 * Used during source discovery and event source scanning.
 */
final class EventPlatformDetectorService
{
    private const EVENT_SIGNATURES = [
        'eventbrite' => ['eventbrite.com', 'eventbrite-s3', 'ebstatic.com', 'eventbrite'],
        'meetup' => ['meetup.com', 'meetup.nyc3', 'meetup'],
        'tribe_events' => ['tribe-events', 'tribe_events', 'the-events-calendar'],
        'ai1ec' => ['ai1ec-', 'ai1ec_event', 'all-in-one-event-calendar'],
        'events_manager' => ['em-item', 'events-manager', 'em_event'],
        'eventon' => ['eventon', 'evo_event'],
        'fullcalendar' => ['fullcalendar', 'fc-event'],
        'google_calendar' => ['calendar.google.com', 'calendar.google.com/calendar/embed'],
        'facebook_events' => ['facebook.com/events', 'fb.com/events'],
        'schema_event' => ['"@type":"Event"', '"@type": "Event"'],
    ];

    /**
     * Scan a single URL's HTML for event platform signatures.
     *
     * @return array{platforms: array<string>, event_urls: array<string>, ical_urls: array<string>}
     */
    public function detectFromHtml(string $url, string $html): array
    {
        $htmlLower = mb_strtolower($html);
        $platforms = [];
        $eventUrls = [];
        $icalUrls = [];

        foreach (self::EVENT_SIGNATURES as $slug => $signatures) {
            foreach ($signatures as $sig) {
                if (str_contains($htmlLower, mb_strtolower($sig))) {
                    $platforms[] = $slug;
                    break;
                }
            }
        }
        $platforms = array_values(array_unique($platforms));

        $eventUrls = $this->discoverEventUrls($url, $html);
        $icalUrls = $this->extractIcalUrls($url, $html);

        return [
            'platforms' => $platforms,
            'event_urls' => $eventUrls,
            'ical_urls' => $icalUrls,
        ];
    }

    /**
     * Discover linked event/calendar URLs from page HTML.
     *
     * @return array<string>
     */
    public function discoverEventUrls(string $baseUrl, string $html): array
    {
        $base = $this->baseUrl($baseUrl);
        $paths = [];
        $keywords = ['events', 'event', 'calendar', 'calendars', 'upcoming-events', 'event-calendar', 'schedule', 'program'];

        // Match href values containing event-related paths
        if (preg_match_all('/<a[^>]+href=["\']([^"\']+)["\'][^>]*>/i', $html, $matches)) {
            foreach ($matches[1] as $href) {
                $href = mb_trim($href);
                if ($href === '' || str_starts_with($href, '#') || str_starts_with($href, 'javascript:')) {
                    continue;
                }
                $path = $this->pathFromHref($href, $base);
                if ($path === null) {
                    continue;
                }
                $pathLower = mb_strtolower($path);
                foreach ($keywords as $kw) {
                    if (str_contains($pathLower, $kw)) {
                        $full = $this->absoluteUrl($href, $base);
                        if ($full && ! in_array($full, $paths, true)) {
                            $paths[] = $full;
                        }
                        break;
                    }
                }
            }
        }

        return array_values(array_unique($paths));
    }

    /**
     * Check if HTML contains schema.org Event JSON-LD.
     */
    public function hasSchemaOrgEvents(string $html): bool
    {
        return str_contains(mb_strtolower($html), '"@type":"event"')
            || str_contains(mb_strtolower($html), '"@type": "event"');
    }

    /**
     * Extract iCal URLs from page (link rel, href .ics).
     *
     * @return array<string>
     */
    public function extractIcalUrls(string $baseUrl, string $html): array
    {
        $base = $this->baseUrl($baseUrl);
        $urls = [];

        // <link rel="alternate" type="text/calendar" href="...">
        if (preg_match_all('/<link[^>]+(?:type=["\']text\/calendar["\']|href=["\']([^"\']+\.ics[^"\']*)["\'])[^>]*>/i', $html, $m)) {
            foreach ($m[1] ?? [] as $href) {
                if ($href && str_contains(mb_strtolower($href), '.ics')) {
                    $urls[] = $this->absoluteUrl($href, $base);
                }
            }
        }
        if (preg_match_all('/<link[^>]+href=["\']([^"\']+\.ics[^"\']*)["\'][^>]+type=["\']text\/calendar["\'][^>]*>/i', $html, $m)) {
            foreach ($m[1] ?? [] as $href) {
                if ($href) {
                    $urls[] = $this->absoluteUrl($href, $base);
                }
            }
        }

        // <a href="...calendar.ics"> or similar
        if (preg_match_all('/<a[^>]+href=["\']([^"\']*\.ics[^"\']*)["\'][^>]*>/i', $html, $m)) {
            foreach ($m[1] ?? [] as $href) {
                if ($href) {
                    $urls[] = $this->absoluteUrl($href, $base);
                }
            }
        }

        return array_values(array_unique(array_filter($urls)));
    }

    private function baseUrl(string $url): string
    {
        $parsed = parse_url($url);
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';

        return $scheme.'://'.$host;
    }

    private function pathFromHref(string $href, string $base): ?string
    {
        $abs = $this->absoluteUrl($href, $base);
        if (! $abs) {
            return null;
        }
        $parsed = parse_url($abs);

        return $parsed['path'] ?? '/';
    }

    private function absoluteUrl(?string $url, string $base): ?string
    {
        if (! $url || $url === '') {
            return null;
        }
        $url = mb_trim($url);
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }
        if (str_starts_with($url, '//')) {
            return 'https:'.$url;
        }
        $base = mb_rtrim($base, '/');
        if (str_starts_with($url, '/')) {
            $parsed = parse_url($base);

            return ($parsed['scheme'] ?? 'https').'://'.($parsed['host'] ?? '').$url;
        }

        return $base.'/'.mb_ltrim($url, '/');
    }
}
