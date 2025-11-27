<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Contracts\GeocodingServiceInterface;
use App\Models\Venue;
use App\Models\Workspace;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class VenueMatchingService
{
    public function __construct(
        private readonly GeocodingServiceInterface $geocodingService
    ) {}

    /**
     * Match existing venue or create new one
     */
    public function matchOrCreate(?string $venueName, ?string $address = null, ?string $regionName = null): ?Venue
    {
        if (empty($venueName)) {
            return null;
        }

        // Try to find existing venue
        $venue = $this->findMatchingVenue($venueName, $address);

        if ($venue) {
            Log::info('VenueMatchingService: Found matching venue', [
                'venue_id' => $venue->id,
                'venue_name' => $venue->name,
                'searched_name' => $venueName,
            ]);

            return $venue;
        }

        // Create new venue under system workspace
        return $this->createVenue($venueName, $address, $regionName);
    }

    /**
     * Find matching venue using name matching
     */
    private function findMatchingVenue(string $venueName, ?string $address): ?Venue
    {
        $threshold = config('news-workflow.event_extraction.venue_match_threshold', 0.85);

        // First try exact match (case-insensitive)
        $venue = Venue::whereRaw('LOWER(name) = ?', [Str::lower($venueName)])->first();

        if ($venue) {
            return $venue;
        }

        // Try fuzzy match against existing venues
        $venues = Venue::all();
        $bestMatch = null;
        $bestSimilarity = 0;

        foreach ($venues as $candidate) {
            $similarity = $this->calculateSimilarity($venueName, $candidate->name);

            if ($similarity >= $threshold && $similarity > $bestSimilarity) {
                $bestMatch = $candidate;
                $bestSimilarity = $similarity;
            }
        }

        if ($bestMatch) {
            Log::info('VenueMatchingService: Fuzzy matched venue', [
                'venue_id' => $bestMatch->id,
                'venue_name' => $bestMatch->name,
                'searched_name' => $venueName,
                'similarity' => $bestSimilarity,
            ]);
        }

        return $bestMatch;
    }

    /**
     * Create new venue under system workspace
     */
    private function createVenue(string $venueName, ?string $address, ?string $regionName): Venue
    {
        $systemWorkspace = $this->getSystemWorkspace();

        // Geocode the venue
        $geoData = $this->geocodingService->geocodeVenue($venueName, $address, $regionName);

        $venueData = [
            'name' => $venueName,
            'description' => 'AI-extracted venue, pending review.',
            'venue_type' => 'Event Spaces',
            'capacity' => 100,
            'price_per_hour' => 0,
            'price_per_event' => 0,
            'price_per_day' => 0,
            'address' => $address ?? $geoData['formatted_address'] ?? null,
            'status' => 'active',
            'workspace_id' => $systemWorkspace->id,
        ];

        if ($geoData) {
            $venueData['latitude'] = $geoData['latitude'];
            $venueData['longitude'] = $geoData['longitude'];
            $venueData['postal_code'] = $geoData['postal_code'];
            $venueData['google_place_id'] = $geoData['google_place_id'];
        }

        $venue = Venue::create($venueData);

        Log::info('VenueMatchingService: Created new venue', [
            'venue_id' => $venue->id,
            'venue_name' => $venue->name,
            'has_geocode' => $geoData !== null,
        ]);

        return $venue;
    }

    /**
     * Calculate Levenshtein-based similarity score (0-1)
     */
    private function calculateSimilarity(string $str1, string $str2): float
    {
        $str1 = Str::lower(mb_trim($str1));
        $str2 = Str::lower(mb_trim($str2));

        // Exact match
        if ($str1 === $str2) {
            return 1.0;
        }

        // Check if one contains the other
        if (str_contains($str1, $str2) || str_contains($str2, $str1)) {
            return 0.9;
        }

        // Levenshtein distance
        $levenshtein = levenshtein($str1, $str2);
        $maxLen = max(mb_strlen($str1), mb_strlen($str2));

        if ($maxLen === 0) {
            return 1.0;
        }

        return 1 - ($levenshtein / $maxLen);
    }

    /**
     * Get or create system workspace
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
