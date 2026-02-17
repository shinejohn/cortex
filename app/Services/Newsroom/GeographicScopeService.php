<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\RawContent;
use App\Models\Region;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class GeographicScopeService
{
    /**
     * Resolve which Region IDs a RawContent record should publish to.
     * Returns array of Region UUID strings.
     *
     * Resolution order:
     * 1. Dateline city/state → region match
     * 2. Mentioned businesses with known locations → their regions
     * 3. Mentioned locations → region name match
     * 4. Source community's region as fallback
     * 5. For statewide/national scope → all active regions
     */
    public function resolveRegions(RawContent $raw): array
    {
        // 1. Match by dateline
        if ($raw->dateline_city && $raw->dateline_state) {
            $ids = $this->matchByDateline($raw->dateline_city, $raw->dateline_state);
            if (! empty($ids)) {
                return $ids;
            }
        }

        // 2. Match by business locations
        if (! empty($raw->businesses_mentioned)) {
            $ids = $this->matchByBusinessLocations($raw->businesses_mentioned);
            if (! empty($ids)) {
                return $ids;
            }
        }

        // 3. Match by mentioned locations
        if (! empty($raw->locations_mentioned)) {
            $ids = $this->matchByLocationNames($raw->locations_mentioned);
            if (! empty($ids)) {
                return $ids;
            }
        }

        // 4. Fall back to community's region
        if ($raw->community_id) {
            $community = $raw->community ?? \App\Models\Community::find($raw->community_id);
            if ($community !== null) {
                $regionId = $community->region_id ?? $this->getRegionIdFromCommunity($community);
                if ($regionId) {
                    return [$regionId];
                }
            }
        }

        // 5. National/statewide: publish to all active regions
        if (in_array($raw->geographic_scope, ['national', 'statewide'])) {
            if ($raw->geographic_scope === 'statewide' && $raw->dateline_state) {
                $stateRegion = $this->findStateRegion($raw->dateline_state);
                if ($stateRegion) {
                    return $this->getDescendantRegionIds($stateRegion->id);
                }
            }

            return Region::where('is_active', true)->pluck('id')->toArray();
        }

        Log::warning('GeographicScope: No region resolved', ['raw_content_id' => $raw->id]);

        return [];
    }

    /**
     * Resolve region IDs from dateline only (for use before RawContent has community).
     */
    public function resolveRegionsFromDateline(?string $city, ?string $state, ?string $geographicScope = null): array
    {
        if ($city && $state) {
            $ids = $this->matchByDateline($city, $state);
            if (! empty($ids)) {
                return $ids;
            }
        }

        if ($geographicScope === 'statewide' && $state) {
            $stateRegion = $this->findStateRegion($state);
            if ($stateRegion) {
                return $this->getDescendantRegionIds($stateRegion->id);
            }
        }

        if ($geographicScope === 'national') {
            return Region::where('is_active', true)->pluck('id')->toArray();
        }

        return [];
    }

    /**
     * Parse a press release dateline from the beginning of body text.
     * Wire services use standard AP-style datelines: "CITY, State -- " or "CITY, ST"
     *
     * Examples: "NEW YORK, March 15, 2026", "CLEARWATER, Fla. --", "SAN FRANCISCO, CA"
     */
    public function parseDateline(string $content): array
    {
        $patterns = [
            '/^([A-Z][A-Z\s.]+),\s*([A-Z][a-z]+\.?)\s*[-–—]/m',   // CITY, State. --
            '/^([A-Z][A-Z\s.]+),\s*([A-Z]{2})\s/m',                // CITY, ST
            '/^([A-Z][A-Z\s.]+)\s*[-–—]/m',                         // CITY --
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, mb_trim($content), $matches)) {
                $city = mb_trim($matches[1]);
                $state = isset($matches[2]) ? $this->normalizeState(mb_trim($matches[2])) : null;

                return ['city' => $city, 'state' => $state];
            }
        }

        return [];
    }

    private function matchByDateline(string $city, string $state): array
    {
        $stateRegion = $this->findStateRegion($state);
        if (! $stateRegion) {
            return [];
        }

        $descendantIds = $this->getDescendantRegionIds($stateRegion->id);

        return Region::whereIn('id', $descendantIds)
            ->where(function ($q) use ($city) {
                $q->where('name', 'LIKE', "%{$city}%")
                    ->orWhereRaw("metadata->>'cities' LIKE ?", ['%'.$city.'%']);
            })
            ->pluck('id')
            ->toArray();
    }

    private function findStateRegion(string $state): ?Region
    {
        $stateUpper = mb_strtoupper($state);

        return Region::where('type', 'state')
            ->where('is_active', true)
            ->where(function ($q) use ($stateUpper) {
                $q->whereRaw('LOWER(slug) = ?', [mb_strtolower($stateUpper)])
                    ->orWhere('name', 'LIKE', "%{$stateUpper}%");
            })
            ->first();
    }

    private function getDescendantRegionIds(string $regionId): array
    {
        $ids = [$regionId];
        $current = [$regionId];

        while (! empty($current)) {
            $children = Region::whereIn('parent_id', $current)->pluck('id')->toArray();
            $ids = array_merge($ids, $children);
            $current = $children;
        }

        return array_unique($ids);
    }

    private function matchByBusinessLocations(array $businessesMentioned): array
    {
        $ids = collect($businessesMentioned)->pluck('business_id')->filter()->unique()->toArray();
        if (empty($ids)) {
            return [];
        }

        return DB::table('business_region')
            ->whereIn('business_id', $ids)
            ->pluck('region_id')
            ->unique()
            ->toArray();
    }

    private function matchByLocationNames(array $locationsMentioned): array
    {
        $regionIds = [];
        foreach ($locationsMentioned as $loc) {
            $name = $loc['name'] ?? '';
            if (empty($name)) {
                continue;
            }
            $matched = Region::where('name', 'LIKE', "%{$name}%")->pluck('id')->toArray();
            $regionIds = array_merge($regionIds, $matched);
        }

        return array_unique($regionIds);
    }

    private function getRegionIdFromCommunity(\App\Models\Community $community): ?string
    {
        $regionId = \App\Models\NewsSource::where('community_id', $community->id)
            ->whereNotNull('region_id')
            ->value('region_id');

        if ($regionId) {
            return $regionId;
        }

        $state = $community->state ?? $community->attributes['state'] ?? null;
        $city = $community->city ?? $community->attributes['city'] ?? $community->name ?? null;
        if ($state && $city) {
            $stateCode = mb_strlen($state) === 2 ? $state : ($this->normalizeState($state) ?? $state);
            $ids = $this->matchByDateline($city, $stateCode);

            return $ids[0] ?? null;
        }

        return null;
    }

    /**
     * Normalize AP-style state abbreviations to 2-letter codes.
     */
    private function normalizeState(string $state): ?string
    {
        if (mb_strlen($state) === 2 && ctype_upper($state)) {
            return $state;
        }

        $map = [
            'Ala.' => 'AL', 'Alaska' => 'AK', 'Ariz.' => 'AZ', 'Ark.' => 'AR',
            'Calif.' => 'CA', 'Colo.' => 'CO', 'Conn.' => 'CT', 'Del.' => 'DE',
            'Fla.' => 'FL', 'Ga.' => 'GA', 'Hawaii' => 'HI', 'Idaho' => 'ID',
            'Ill.' => 'IL', 'Ind.' => 'IN', 'Iowa' => 'IA', 'Kan.' => 'KS',
            'Ky.' => 'KY', 'La.' => 'LA', 'Maine' => 'ME', 'Md.' => 'MD',
            'Mass.' => 'MA', 'Mich.' => 'MI', 'Minn.' => 'MN', 'Miss.' => 'MS',
            'Mo.' => 'MO', 'Mont.' => 'MT', 'Neb.' => 'NE', 'Nev.' => 'NV',
            'N.H.' => 'NH', 'N.J.' => 'NJ', 'N.M.' => 'NM', 'N.Y.' => 'NY',
            'N.C.' => 'NC', 'N.D.' => 'ND', 'Ohio' => 'OH', 'Okla.' => 'OK',
            'Ore.' => 'OR', 'Pa.' => 'PA', 'R.I.' => 'RI', 'S.C.' => 'SC',
            'S.D.' => 'SD', 'Tenn.' => 'TN', 'Texas' => 'TX', 'Utah' => 'UT',
            'Vt.' => 'VT', 'Va.' => 'VA', 'Wash.' => 'WA', 'W.Va.' => 'WV',
            'Wis.' => 'WI', 'Wyo.' => 'WY',
        ];

        return $map[$state] ?? null;
    }
}
