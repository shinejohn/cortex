<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Models\AdCampaign;
use App\Models\Business;
use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;

final class NearbyBusinessService
{
    /**
     * Find businesses near a given coordinate within a radius.
     *
     * @return Collection<int, Business>
     */
    public function findNearby(float $lat, float $lng, float $radiusMiles = 5, int $limit = 20): Collection
    {
        $radiusKm = $radiusMiles * 1.60934;

        return Business::query()
            ->selectRaw('
                businesses.*,
                (6371 * acos(cos(radians(?))
                * cos(radians(latitude))
                * cos(radians(longitude) - radians(?))
                + sin(radians(?))
                * sin(radians(latitude)))) AS distance
            ', [$lat, $lng, $lat])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->havingRaw('distance < ?', [$radiusKm])
            ->orderBy('distance')
            ->limit($limit)
            ->get();
    }

    /**
     * Get businesses near a specific event's location.
     *
     * @return Collection<int, Business>
     */
    public function getBusinessesNearEvent(Event $event, float $radiusMiles = 2): Collection
    {
        if ($event->latitude === null || $event->longitude === null) {
            return new Collection;
        }

        return $this->findNearby(
            (float) $event->latitude,
            (float) $event->longitude,
            $radiusMiles
        );
    }

    /**
     * Get businesses that have active ad campaigns near a location.
     *
     * @return Collection<int, Business>
     */
    public function getPromotedBusinesses(float $lat, float $lng): Collection
    {
        $activeCampaignAdvertiserIds = AdCampaign::query()
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->whereRaw('spent < budget')
            ->pluck('advertiser_id');

        if ($activeCampaignAdvertiserIds->isEmpty()) {
            return new Collection;
        }

        $radiusKm = 5 * 1.60934;

        return Business::query()
            ->selectRaw('
                businesses.*,
                (6371 * acos(cos(radians(?))
                * cos(radians(latitude))
                * cos(radians(longitude) - radians(?))
                + sin(radians(?))
                * sin(radians(latitude)))) AS distance
            ', [$lat, $lng, $lat])
            ->whereIn('id', $activeCampaignAdvertiserIds)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->havingRaw('distance < ?', [$radiusKm])
            ->orderBy('distance')
            ->limit(10)
            ->get();
    }
}
